
import os
import sys

import cv2
import numpy as np
from PIL import Image
from rembg import remove

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

INP = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "source-photo.png")
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "source-prepped.png")

# SETTINGS
REMOVE_BACKGROUND = False
SMOOTHING = 0          # 0 = none, 1 = very mild
CONTRAST = 1.0         # 1.0 = preserve original contrast
BRIGHTNESS = 0         # 0 = preserve original brightness
LINE_WEIGHT = 0.5      # 0 = no artificial line enhancement
PADDING = 5

# 1. Load the original image
image = Image.open(INP).convert("RGBA")

# 2. Optional background removal
if REMOVE_BACKGROUND:
    image = remove(image)

rgba = np.array(image)
rgb = rgba[:, :, :3]
alpha = rgba[:, :, 3]

# 3. Convert to grayscale
gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)

# 4. Optional light smoothing
if SMOOTHING > 0:
    gray = cv2.bilateralFilter(gray, 5, 15, 5)

# 5. Preserve original tones
tone = gray.astype(np.float32)

tone = (tone - 127.5) * CONTRAST + 127.5 + BRIGHTNESS
tone = np.clip(tone, 0, 255)

# 6. Optional line enhancement
if LINE_WEIGHT > 0:
    fine = cv2.GaussianBlur(gray, (0, 0), 1.0).astype(np.float32)
    coarse = cv2.GaussianBlur(gray, (0, 0), 3.0).astype(np.float32)

    lines = np.clip((coarse - fine) / 40.0, 0, 1)
    tone = np.clip(tone - LINE_WEIGHT * lines * 255, 0, 255)

# 7. Composite onto white
mask = alpha.astype(np.float32) / 255.0
output = tone * mask + 255.0 * (1.0 - mask)

# 8. Square crop around subject
ys, xs = np.where(alpha > 20)

if len(xs) == 0:
    raise ValueError("No visible subject detected. Check background removal.")

side = int(max(
    xs.max() - xs.min() + 1,
    ys.max() - ys.min() + 1
) + 2 * PADDING)

cx = int((xs.min() + xs.max()) / 2)
cy = int((ys.min() + ys.max()) / 2)

canvas = np.full((side, side), 255, dtype=np.uint8)

x0 = cx - side // 2
y0 = cy - side // 2

sx0 = max(x0, 0)
sy0 = max(y0, 0)
sx1 = min(x0 + side, output.shape[1])
sy1 = min(y0 + side, output.shape[0])

canvas[
    sy0-y0:sy1-y0,
    sx0-x0:sx1-x0
] = output[sy0:sy1, sx0:sx1].astype(np.uint8)

Image.fromarray(canvas).save(OUT)

print("Wrote:", OUT)
print("Size:", canvas.shape)
