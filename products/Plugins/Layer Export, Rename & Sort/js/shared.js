function getElement(id) {
  return document.getElementById(id);
}

function extractSharedHtmlBody(markup) {
  const text = String(markup || "");
  const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch && typeof bodyMatch[1] === "string") {
    return bodyMatch[1].replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  }
  return text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

async function readSharedPluginTextFileFromIframe(relativePath) {
  if (typeof document === "undefined" || !document.createElement || !document.body) {
    throw new Error("Iframe loading is unavailable.");
  }

  return await new Promise(function (resolve, reject) {
    const frame = document.createElement("iframe");
    frame.style.display = "none";
    frame.setAttribute("aria-hidden", "true");

    const cleanup = function () {
      if (frame.parentNode) {
        frame.parentNode.removeChild(frame);
      }
    };

    frame.onload = function () {
      try {
        const frameDocument = frame.contentDocument || (frame.contentWindow && frame.contentWindow.document);
        const body = frameDocument && frameDocument.body;
        const markup = body ? body.innerHTML : "";
        cleanup();
        if (markup) {
          resolve(markup);
          return;
        }
        reject(new Error("Empty iframe fragment."));
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    frame.onerror = function () {
      cleanup();
      reject(new Error("Could not load iframe fragment."));
    };

    frame.src = relativePath;
    document.body.appendChild(frame);
  });
}

async function readSharedPluginTextFileFromXhr(relativePath) {
  if (typeof XMLHttpRequest !== "function") {
    throw new Error("XHR loading is unavailable.");
  }

  return await new Promise(function (resolve, reject) {
    const request = new XMLHttpRequest();
    request.open("GET", relativePath, true);

    request.onload = function () {
      const isSuccessful = (request.status >= 200 && request.status < 300) || request.status === 0;
      if (isSuccessful && request.responseText) {
        resolve(request.responseText);
        return;
      }
      reject(new Error("Could not load XHR fragment."));
    };

    request.onerror = function () {
      reject(new Error("Could not load XHR fragment."));
    };

    request.send();
  });
}

async function readSharedPluginTextFile(relativePath) {
  if (!relativePath) {
    throw new Error("Missing file path.");
  }

  if (typeof fetch === "function") {
    try {
      const response = await fetch(relativePath);
      if (response && response.ok) {
        return await response.text();
      }
    } catch (error) {}
  }

  try {
    return await readSharedPluginTextFileFromXhr(relativePath);
  } catch (error) {}

  try {
    return await readSharedPluginTextFileFromIframe(relativePath);
  } catch (error) {}

  if (typeof require === "function") {
    const uxpModule = require("uxp");
    const fs = uxpModule && uxpModule.storage ? uxpModule.storage.localFileSystem : null;
    if (fs && typeof fs.getPluginFolder === "function") {
      const pluginFolder = await fs.getPluginFolder();
      const parts = String(relativePath).replace(/\\/g, "/").split("/").filter(Boolean);
      let currentEntry = pluginFolder;

      for (let index = 0; index < parts.length; index += 1) {
        const part = parts[index];
        if (!currentEntry) {
          throw new Error("Could not resolve fragment path.");
        }

        if (typeof currentEntry.getEntry === "function") {
          currentEntry = await currentEntry.getEntry(part);
          continue;
        }

        if (typeof currentEntry.getEntries === "function") {
          const entries = await currentEntry.getEntries();
          let matchedEntry = null;
          for (let entryIndex = 0; entryIndex < entries.length; entryIndex += 1) {
            if (entries[entryIndex] && entries[entryIndex].name === part) {
              matchedEntry = entries[entryIndex];
              break;
            }
          }
          currentEntry = matchedEntry;
          continue;
        }

        currentEntry = null;
      }

      if (currentEntry && typeof currentEntry.read === "function") {
        return await currentEntry.read();
      }
    }
  }

  throw new Error("Could not load fragment: " + relativePath);
}

async function loadSharedHtmlFragmentInto(containerId, relativePath) {
  const container = getElement(containerId);
  if (!container) {
    throw new Error("Missing fragment container: " + containerId);
  }

  const markup = await readSharedPluginTextFile(relativePath);
  container.innerHTML = extractSharedHtmlBody(markup);
  return container;
}

// Shared Tabs Helpers
function getSharedTabButtons(groupName) {
  if (!groupName || typeof document.querySelectorAll !== "function") {
    return [];
  }

  const buttons = document.querySelectorAll('[data-shared-tab-group="' + groupName + '"]');
  return Array.prototype.slice.call(buttons || []);
}

function getActiveSharedTabValue(groupName) {
  const buttons = getSharedTabButtons(groupName);
  for (let index = 0; index < buttons.length; index += 1) {
    if (buttons[index].classList.contains("is-active")) {
      return buttons[index].getAttribute("data-shared-tab-value");
    }
  }

  return buttons.length ? buttons[0].getAttribute("data-shared-tab-value") : "";
}

function syncSharedTabGroup(groupName, activeValue) {
  const buttons = getSharedTabButtons(groupName);
  if (!buttons.length) {
    return "";
  }

  let resolvedValue = activeValue;
  let hasMatch = false;
  for (let index = 0; index < buttons.length; index += 1) {
    if (buttons[index].getAttribute("data-shared-tab-value") === activeValue) {
      hasMatch = true;
      break;
    }
  }

  if (!hasMatch) {
    resolvedValue = buttons[0].getAttribute("data-shared-tab-value");
  }

  for (let index = 0; index < buttons.length; index += 1) {
    const button = buttons[index];
    const panelId = button.getAttribute("data-shared-tab-panel");
    const panel = panelId ? getElement(panelId) : null;
    const isActive = button.getAttribute("data-shared-tab-value") === resolvedValue;

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
    button.setAttribute("tabindex", isActive ? "0" : "-1");

    if (panel) {
      panel.classList.toggle("is-hidden", !isActive);
    }
  }

  return resolvedValue;
}

function bindSharedTabGroup(groupName, afterChange) {
  const buttons = getSharedTabButtons(groupName);
  if (!buttons.length) {
    return;
  }

  const focusButtonAtIndex = function (nextIndex) {
    if (buttons[nextIndex] && typeof buttons[nextIndex].focus === "function") {
      buttons[nextIndex].focus();
    }
  };

  const activateButton = function (button) {
    const nextValue = button.getAttribute("data-shared-tab-value");
    const resolvedValue = syncSharedTabGroup(groupName, nextValue);
    if (typeof afterChange === "function") {
      afterChange(resolvedValue);
    }
  };

  for (let index = 0; index < buttons.length; index += 1) {
    const button = buttons[index];
    if (button.getAttribute("data-shared-tab-bound") === "true") {
      continue;
    }

    button.setAttribute("data-shared-tab-bound", "true");
    button.addEventListener("click", function () {
      activateButton(button);
    });

    button.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateButton(button);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        focusButtonAtIndex((index + 1) % buttons.length);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        focusButtonAtIndex((index - 1 + buttons.length) % buttons.length);
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        focusButtonAtIndex(0);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        focusButtonAtIndex(buttons.length - 1);
      }
    });
  }
}

// Shared Slider Helpers
function clampSharedSliderNumber(value, min, max) {
  const numericValue = Number(value);
  const numericMin = Number(min);
  const numericMax = Number(max);

  if (!Number.isFinite(numericValue)) {
    return Number.isFinite(numericMin) ? numericMin : 0;
  }

  if (numericValue < numericMin) {
    return numericMin;
  }
  if (numericValue > numericMax) {
    return numericMax;
  }

  return numericValue;
}

function roundSharedSliderValue(value, min, max, step) {
  const numericMin = Number(min || 0);
  const numericMax = Number(max || 100);
  const numericStep = Number(step || 1);
  let nextValue = Number(value || 0);

  if (numericStep > 0) {
    nextValue = Math.round(nextValue / numericStep) * numericStep;
  }

  return clampSharedSliderNumber(nextValue, numericMin, numericMax);
}

function getSharedSliderInput(sliderElement) {
  if (!sliderElement || typeof sliderElement.getAttribute !== "function") {
    return null;
  }

  const inputId = sliderElement.getAttribute("data-input-id");
  return inputId ? getElement(inputId) : null;
}

function getSharedSliderElementByInputId(inputId) {
  if (!inputId || typeof document.querySelector !== "function") {
    return null;
  }

  return document.querySelector('.shared-slider[data-input-id="' + inputId + '"]');
}

function dispatchSharedSliderEvent(input, type) {
  if (!input) {
    return;
  }

  try {
    input.dispatchEvent(new Event(type, { bubbles: true }));
    return;
  } catch (error) {}

  if (typeof document.createEvent === "function") {
    const legacyEvent = document.createEvent("Event");
    legacyEvent.initEvent(type, true, true);
    input.dispatchEvent(legacyEvent);
  }
}

function syncSharedSlider(sliderElement) {
  const input = getSharedSliderInput(sliderElement);
  const track = sliderElement && sliderElement.querySelector ? sliderElement.querySelector(".shared-slider-track") : null;
  const fill = sliderElement && sliderElement.querySelector ? sliderElement.querySelector(".shared-slider-fill") : null;
  const thumb = sliderElement && sliderElement.querySelector ? sliderElement.querySelector(".shared-slider-thumb") : null;

  if (!sliderElement || !input || !track || !fill || !thumb) {
    return;
  }

  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const step = Number(input.step || 1);
  const value = roundSharedSliderValue(input.value, min, max, step);
  const ratio = max > min ? (value - min) / (max - min) : 0;
  const percent = Math.max(0, Math.min(100, ratio * 100));

  input.value = value;
  fill.style.width = percent + "%";
  thumb.style.left = percent + "%";
  sliderElement.classList.toggle("is-disabled", !!input.disabled);
  sliderElement.setAttribute("aria-disabled", input.disabled ? "true" : "false");
  sliderElement.setAttribute("aria-valuemin", String(min));
  sliderElement.setAttribute("aria-valuemax", String(max));
  sliderElement.setAttribute("aria-valuenow", String(value));
}

function syncSharedSliderByInputId(inputId) {
  const sliderElement = getSharedSliderElementByInputId(inputId);
  if (sliderElement) {
    syncSharedSlider(sliderElement);
  }
}

function getSharedSliderValueFromClientX(sliderElement, clientX) {
  const input = getSharedSliderInput(sliderElement);
  const track = sliderElement && sliderElement.querySelector ? sliderElement.querySelector(".shared-slider-track") : null;

  if (!input || !track || typeof track.getBoundingClientRect !== "function") {
    return 0;
  }

  const rect = track.getBoundingClientRect();
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const step = Number(input.step || 1);

  if (!rect || !rect.width) {
    return roundSharedSliderValue(input.value, min, max, step);
  }

  const ratio = clampSharedSliderNumber((clientX - rect.left) / rect.width, 0, 1);
  const rawValue = min + ((max - min) * ratio);
  return roundSharedSliderValue(rawValue, min, max, step);
}

function setSharedSliderInputValue(sliderElement, nextValue, eventType) {
  const input = getSharedSliderInput(sliderElement);
  if (!input) {
    return;
  }

  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const step = Number(input.step || 1);
  const previousValue = String(input.value);
  const roundedValue = roundSharedSliderValue(nextValue, min, max, step);

  input.value = roundedValue;
  syncSharedSlider(sliderElement);

  if (eventType && (String(roundedValue) !== previousValue || eventType === "change")) {
    dispatchSharedSliderEvent(input, eventType);
  }
}

function bindSharedSlider(sliderId) {
  const sliderElement = getElement(sliderId);
  const input = getSharedSliderInput(sliderElement);
  if (!sliderElement || !input || sliderElement.getAttribute("data-bound") === "true") {
    return;
  }

  sliderElement.setAttribute("data-bound", "true");

  sliderElement.addEventListener("mousedown", function (event) {
    if (input.disabled) {
      return;
    }

    event.preventDefault();
    sliderElement.classList.add("is-dragging");
    setSharedSliderInputValue(sliderElement, getSharedSliderValueFromClientX(sliderElement, event.clientX), "input");

    const handleMouseMove = function (moveEvent) {
      setSharedSliderInputValue(sliderElement, getSharedSliderValueFromClientX(sliderElement, moveEvent.clientX), "input");
    };

    const handleMouseUp = function (upEvent) {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      sliderElement.classList.remove("is-dragging");
      setSharedSliderInputValue(sliderElement, getSharedSliderValueFromClientX(sliderElement, upEvent.clientX), "change");
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  });

  sliderElement.addEventListener("keydown", function (event) {
    if (input.disabled) {
      return;
    }

    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const step = Number(input.step || 1);
    const currentValue = roundSharedSliderValue(input.value, min, max, step);
    let nextValue = currentValue;

    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      nextValue = currentValue - step;
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      nextValue = currentValue + step;
    } else if (event.key === "PageDown") {
      nextValue = currentValue - (step * 5);
    } else if (event.key === "PageUp") {
      nextValue = currentValue + (step * 5);
    } else if (event.key === "Home") {
      nextValue = min;
    } else if (event.key === "End") {
      nextValue = max;
    } else {
      return;
    }

    event.preventDefault();
    setSharedSliderInputValue(sliderElement, nextValue, "input");
  });

  input.addEventListener("input", function () {
    syncSharedSlider(sliderElement);
  });

  input.addEventListener("change", function () {
    syncSharedSlider(sliderElement);
  });

  syncSharedSlider(sliderElement);
}

// Shared Collapsible Helpers
function syncCollapsibleSectionState(sectionId, buttonId, iconId, isCollapsed) {
  const section = getElement(sectionId);
  const button = getElement(buttonId);
  const icon = getElement(iconId);
  if (!section || !button || !icon) {
    return;
  }

  section.classList.toggle("is-collapsed", !!isCollapsed);
  button.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
  icon.textContent = isCollapsed ? "+" : "-";
}

function bindCollapsibleToggle(toggleId, sectionId, iconId, afterToggle) {
  const toggle = getElement(toggleId);
  if (!toggle) {
    return;
  }

  const handleToggle = function () {
    const section = getElement(sectionId);
    const nextCollapsed = !section.classList.contains("is-collapsed");
    syncCollapsibleSectionState(sectionId, toggleId, iconId, nextCollapsed);
    if (typeof afterToggle === "function") {
      afterToggle(nextCollapsed);
    }
  };

  toggle.addEventListener("click", handleToggle);
  toggle.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggle();
    }
  });
}

// Shared Preview Helpers
function renderSharedPreview(previewId, nextText, nextSignature, previousSignature) {
  const previewElement = getElement(previewId);
  if (!previewElement) {
    return previousSignature;
  }

  if (nextSignature !== previousSignature) {
    previewElement.textContent = nextText;
    return nextSignature;
  }

  return previousSignature;
}

function setSharedPreviewVisibility(previewId, shouldShow) {
  const previewElement = getElement(previewId);
  if (!previewElement || !previewElement.parentElement) {
    return;
  }

  previewElement.parentElement.classList.toggle("is-hidden", !shouldShow);
}

// Shared Dialog Helper
async function showSharedModalDialog(dialogId, options) {
  const dialog = getElement(dialogId);
  if (!dialog) {
    return;
  }

  if (typeof dialog.uxpShowModal === "function") {
    await dialog.uxpShowModal(options || {});
    return;
  }

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  }
}
