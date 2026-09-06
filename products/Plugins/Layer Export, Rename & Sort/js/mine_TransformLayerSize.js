async function mine_TransformLayerSize(runtime) {
  if (!runtime || runtime.mode !== "photoshop") {
    await showMineMessage("This command only works inside the Photoshop panel.");
    return;
  }

  if (!runtime.core || typeof runtime.core.executeAsModal !== "function") {
    await showMineMessage("This Photoshop runtime does not support modal commands.");
    return;
  }

  if (!runtime.action || typeof runtime.action.batchPlay !== "function") {
    await showMineMessage("This Photoshop runtime does not support batchPlay.");
    return;
  }

  if (!runtime.app || !runtime.app.documents || !runtime.app.documents.length) {
    await showMineMessage("No document is open.");
    return;
  }

  const mode = getTransformMode();
  const widthInput = getElement("mineTransformWidth");
  const heightInput = getElement("mineTransformHeight");
  const initialWidthVal = widthInput ? parseInt(widthInput.value, 10) : 0;
  const initialHeightVal = heightInput ? parseInt(heightInput.value, 10) : 0;

  if (isNaN(initialWidthVal) || initialWidthVal <= 0 || isNaN(initialHeightVal) || initialHeightVal <= 0) {
    await showMineMessage("Please enter valid width and height values greater than 0.");
    return;
  }

  let successCount = 0;
  let totalCount = 0;
  const errors = [];

  try {
    await runtime.core.executeAsModal(async function () {
      const hostDocument = runtime.app.activeDocument;
      const hostLayers = getMineIndexedItems(hostDocument && hostDocument.activeLayers);

      if (!hostLayers.length) {
        throw new Error("Select at least one layer before running this command.");
      }

      const layersToProcess = hostLayers.map(function (layer) {
        return {
          id: layer.id,
          name: layer.name || ("ID: " + layer.id)
        };
      });

      totalCount = layersToProcess.length;

      const centerCheckbox = getElement("mineTransformCenterEnabled");
      const shouldCenter = centerCheckbox ? centerCheckbox.checked : false;

      await hostDocument.suspendHistory(async function () {
        for (let i = 0; i < layersToProcess.length; i += 1) {
          const layerInfo = layersToProcess[i];
          let originallyVisible = true;
          let activeLayer = null;
          try {
            // 1. Select the specific layer in the host document
            await selectLayerById(runtime, layerInfo.id);

            // Get the active layer to compute bounds
            const currentLayers = getMineIndexedItems(hostDocument.activeLayers);
            activeLayer = currentLayers.length ? currentLayers[0] : null;
            if (!activeLayer) {
              throw new Error("Could not target the layer.");
            }

            // Temporarily make invisible layer visible so Photoshop allows transform
            originallyVisible = activeLayer.visible;
            if (!originallyVisible) {
              activeLayer.visible = true;
            }

            const bounds = activeLayer.boundsNoEffects || activeLayer.bounds;
            let currentWidth = 0;
            let currentHeight = 0;

            if (bounds) {
              const getVal = function (val) {
                if (val && typeof val === "object" && typeof val._value === "number") {
                  return val._value;
                }
                if (val && typeof val === "object" && typeof val.value === "number") {
                  return val.value;
                }
                return Number(val) || 0;
              };

              const left = getVal(bounds.left);
              const right = getVal(bounds.right);
              const top = getVal(bounds.top);
              const bottom = getVal(bounds.bottom);

              currentWidth = right - left;
              currentHeight = bottom - top;
            }

            if (currentWidth <= 0 || currentHeight <= 0) {
              throw new Error("Cannot retrieve active layer bounds (width or height is 0 or invalid).");
            }

            let scaleX = 100;
            let scaleY = 100;
            let widthVal = initialWidthVal;
            let heightVal = initialHeightVal;

            if (mode === "both") {
              scaleX = (widthVal / currentWidth) * 100;
              scaleY = (heightVal / currentHeight) * 100;
            } else if (mode === "fit") {
              const scaleW = (widthVal / currentWidth) * 100;
              const scaleH = (heightVal / currentHeight) * 100;
              scaleX = Math.min(scaleW, scaleH);
              scaleY = scaleX;
            } else if (mode === "fill") {
              const scaleW = (widthVal / currentWidth) * 100;
              const scaleH = (heightVal / currentHeight) * 100;
              scaleX = Math.max(scaleW, scaleH);
              scaleY = scaleX;
            }

            const transformCommand = {
              _obj: "transform",
              _target: [
                {
                  _enum: "ordinal",
                  _ref: "layer",
                  _value: "targetEnum"
                }
              ],
              width: {
                _unit: "percentUnit",
                _value: scaleX
              },
              height: {
                _unit: "percentUnit",
                _value: scaleY
              },
              linked: (mode !== "both"),
              interfaceIconFrameDimmed: {
                _enum: "interpolationType",
                _value: "bicubic"
              }
            };

            const needsScale = (Math.abs(scaleX - 100) > 0.01) || (Math.abs(scaleY - 100) > 0.01);
            if (needsScale) {
              await runtime.action.batchPlay([transformCommand], {});
            }

            if (shouldCenter && hostDocument.selection) {
              try {
                await hostDocument.selection.selectAll();
                await runtime.action.batchPlay([
                  {
                    _obj: "align",
                    _target: [{ _ref: "layer", _enum: "ordinal", _value: "targetEnum" }],
                    using: { _enum: "alignDistributeSelector", _value: "ADSCentersH" }
                  },
                  {
                    _obj: "align",
                    _target: [{ _ref: "layer", _enum: "ordinal", _value: "targetEnum" }],
                    using: { _enum: "alignDistributeSelector", _value: "ADSCentersV" }
                  }
                ], {});
              } finally {
                try {
                  await hostDocument.selection.deselect();
                } catch (e) {}
              }
            }

            // Restore original visibility state if it was hidden
            if (!originallyVisible) {
              activeLayer.visible = false;
            }

            successCount += 1;
          } catch (layerError) {
            // If we temporarily made it visible, hide it again on failure
            if (activeLayer && !originallyVisible) {
              try {
                activeLayer.visible = false;
              } catch (e) {}
            }
            errors.push({
              name: layerInfo.name,
              message: formatMineError(layerError)
            });
          }
        }
      }, "Transform Layer Size");

      // If all selected layers failed, throw a general error to enter the catch block
      if (successCount === 0 && totalCount > 0) {
        throw new Error("All selected layers failed to transform.");
      }
    }, {
      commandName: "Transform Layer Size"
    });

    // Outside the modal, show success / failure details
    if (totalCount > 1 || errors.length > 0) {
      let reportMessage = "Transformed " + successCount + " of " + totalCount + " layer(s) successfully.";
      if (errors.length > 0) {
        reportMessage += "\n\nErrors:\n";
        for (let e = 0; e < errors.length; e += 1) {
          reportMessage += "- " + errors[e].name + ": " + errors[e].message + "\n";
        }
      }
      await showMineMessage(reportMessage);
    }
  } catch (error) {
    if (totalCount <= 1 && errors.length === 1) {
      await showMineMessage("Transform Layer Size failed for '" + errors[0].name + "': " + errors[0].message);
    } else {
      await showMineMessage("Transform Layer Size failed: " + formatMineError(error));
    }
  }
}
