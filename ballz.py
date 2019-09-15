
import cv2
import math
import numpy as np
# from matplotlib import pyplot as plt
# import scipy.stats as st


def drawSquare(frame, pointTopLeft, squareSize, color=(255, 0, 0)):
    """
    @param frame - np.ndarray(np.uint8)

    @returns modified frame - np.ndarray(np.uint8)
    """
    modified_frame = frame.copy()
    y, x = pointTopLeft
#     print(x, y)
    cv2.rectangle(modified_frame, (x, y), (x + squareSize, y + squareSize), color, 5)
    return modified_frame    

def gkern(kernlen=60, nsig=0.5):
    """Returns a 2D Gaussian kernel."""

    x = np.linspace(-nsig, nsig, kernlen+1)
    kern1d = np.diff(st.norm.cdf(x))
    kern2d = np.outer(kern1d, kern1d)
    return kern2d/kern2d.sum()

def spiral(side):
    x = y = 0
    dx = 0
    dy = -1
    for i in range(side ** 2):
        if (-side / 2 < x <= side / 2):
            yield (x, y)
        if x == y or (x < 0 and x == -y) or (x > 0 and x == 1 - y):
            dx, dy = -dy, dx
        x, y = x + dx, y + dy
        
def downsample(frame, k):
    obj = (slice(None, None, k))
    return frame[obj, obj]


def getBallPositionApprox(frame, lastBallPosition, certainty, BALLSIZE, RODSIZE):
    generatorPosition = spiral(2 * RODSIZE)
    x, y = lastBallPosition
    mx = max(0, x - RODSIZE)
    my = max(0, y - RODSIZE)
    subframe = frame[mx : x + RODSIZE, my : y + RODSIZE, : ].astype(int)
    pnkCf = magicFormula(subframe, 4)
    centerPoint = np.unravel_index(pnkCf.argmin(), pnkCf.shape)
    a, b = centerPoint
    a = max(0, a - BALLSIZE // 2) + x - RODSIZE
    b = max(0, b - BALLSIZE // 2) + y - RODSIZE
    topLeftPoint = (a, b)
    return topLeftPoint, pnkCf[a, b]
#     maxSoFar = certainty
#     ballPosition = lastBallPosition
#     while True:
#         try:
#             positionToCheck = next(generatorPosition)
#         except StopIteration:
#             # return the highest one
#             break  # Iterator exhausted: stop the loop

def getBallPosition(frame, BALLSIZE):
    """
    Return top left point of a NxN square with the most probable position of the ball
    """
    frameInt = frame.astype(int)
    confidence = magicFormula(frameInt, BALLSIZE)
    centerPoint = np.unravel_index(confidence.argmin(), confidence.shape)
    x, y = centerPoint
    x = max(0, x - BALLSIZE // 2)
    y = max(0, y - BALLSIZE // 2)
    topLeftPoint = (x, y)
    return topLeftPoint, confidence[x, y]



def markFrame(frame, BALLSIZE, lastBallPosition):
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # downsampledFrame = downsample(frame, 4)
    ballPosition, certainty = getBallPosition(frame, BALLSIZE)
    # ballPosition, certainty = getBallPosition(downsampledFrame, BALLSIZE // 4)
    # ballPosition = tuple([x * 4 for x in ballPosition])
#             print(ballPosition)
    if ballPosition == (0, 0):
        ballPosition = lastBallPosition
    else:
        lastBallPosition = ballPosition
    return cv2.cvtColor(drawSquare(frame, ballPosition, BALLSIZE), cv2.COLOR_RGB2BGR), ballPosition

def markVideo(filename, BALLSIZE, RODSIZE):
    vidcap = cv2.VideoCapture(filename)
    success = True
    lastBallPosition = (0, 0)
    certainty = 0
    markedVideo = []
    while len(markedVideo) < 151:
        # if len(markedVideo) % 100 == 0:
            #print(f"Frame {len(markedVideo)}")
        success, frame = vidcap.read()

        if not success:
            break
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        downsampledFrame = downsample(frame, 4)
        if certainty < 0:
            ballPosition, certainty = getBallPositionApprox(frame, lastBallPosition, certainty, BALLSIZE, RODSIZE)
            markedVideo.append(drawSquare(frame, ballPosition, BALLSIZE, color=(0, 255, 0)))
        else:
            ballPosition, certainty = getBallPosition(downsampledFrame, BALLSIZE // 4)
            ballPosition = tuple([x * 4 for x in ballPosition])
#             print(ballPosition)
            if ballPosition == (0, 0):
                ballPosition = lastBallPosition
            else:
                lastBallPosition = ballPosition

            markedVideo.append(drawSquare(frame, ballPosition, BALLSIZE))
        
    return markedVideo

KERNEL = [[0.00216509, 0.00221434, 0.00225907, 0.00229894, 0.00233368,
        0.00236302, 0.00238677, 0.00240473, 0.00241678, 0.00242283,
        0.00242283, 0.00241678, 0.00240473, 0.00238677, 0.00236302,
        0.00233368, 0.00229894, 0.00225907, 0.00221434, 0.00216509],
       [0.00221434, 0.00226472, 0.00231046, 0.00235124, 0.00238677,
        0.00241678, 0.00244107, 0.00245944, 0.00247176, 0.00247795,
        0.00247795, 0.00247176, 0.00245944, 0.00244107, 0.00241678,
        0.00238677, 0.00235124, 0.00231046, 0.00226472, 0.00221434],
       [0.00225907, 0.00231046, 0.00235712, 0.00239873, 0.00243497,
        0.00246559, 0.00249037, 0.00250911, 0.00252169, 0.002528  ,
        0.002528  , 0.00252169, 0.00250911, 0.00249037, 0.00246559,
        0.00243497, 0.00239873, 0.00235712, 0.00231046, 0.00225907],
       [0.00229894, 0.00235124, 0.00239873, 0.00244107, 0.00247795,
        0.00250911, 0.00253432, 0.0025534 , 0.0025662 , 0.00257262,
        0.00257262, 0.0025662 , 0.0025534 , 0.00253432, 0.00250911,
        0.00247795, 0.00244107, 0.00239873, 0.00235124, 0.00229894],
       [0.00233368, 0.00238677, 0.00243497, 0.00247795, 0.00251539,
        0.00254703, 0.00257262, 0.00259198, 0.00260497, 0.00261149,
        0.00261149, 0.00260497, 0.00259198, 0.00257262, 0.00254703,
        0.00251539, 0.00247795, 0.00243497, 0.00238677, 0.00233368],
       [0.00236302, 0.00241678, 0.00246559, 0.00250911, 0.00254703,
        0.00257906, 0.00260497, 0.00262458, 0.00263773, 0.00264433,
        0.00264433, 0.00263773, 0.00262458, 0.00260497, 0.00257906,
        0.00254703, 0.00250911, 0.00246559, 0.00241678, 0.00236302],
       [0.00238677, 0.00244107, 0.00249037, 0.00253432, 0.00257262,
        0.00260497, 0.00263115, 0.00265095, 0.00266423, 0.0026709 ,
        0.0026709 , 0.00266423, 0.00265095, 0.00263115, 0.00260497,
        0.00257262, 0.00253432, 0.00249037, 0.00244107, 0.00238677],
       [0.00240473, 0.00245944, 0.00250911, 0.0025534 , 0.00259198,
        0.00262458, 0.00265095, 0.0026709 , 0.00268429, 0.002691  ,
        0.002691  , 0.00268429, 0.0026709 , 0.00265095, 0.00262458,
        0.00259198, 0.0025534 , 0.00250911, 0.00245944, 0.00240473],
       [0.00241678, 0.00247176, 0.00252169, 0.0025662 , 0.00260497,
        0.00263773, 0.00266423, 0.00268429, 0.00269774, 0.00270449,
        0.00270449, 0.00269774, 0.00268429, 0.00266423, 0.00263773,
        0.00260497, 0.0025662 , 0.00252169, 0.00247176, 0.00241678],
       [0.00242283, 0.00247795, 0.002528  , 0.00257262, 0.00261149,
        0.00264433, 0.0026709 , 0.002691  , 0.00270449, 0.00271126,
        0.00271126, 0.00270449, 0.002691  , 0.0026709 , 0.00264433,
        0.00261149, 0.00257262, 0.002528  , 0.00247795, 0.00242283],
       [0.00242283, 0.00247795, 0.002528  , 0.00257262, 0.00261149,
        0.00264433, 0.0026709 , 0.002691  , 0.00270449, 0.00271126,
        0.00271126, 0.00270449, 0.002691  , 0.0026709 , 0.00264433,
        0.00261149, 0.00257262, 0.002528  , 0.00247795, 0.00242283],
       [0.00241678, 0.00247176, 0.00252169, 0.0025662 , 0.00260497,
        0.00263773, 0.00266423, 0.00268429, 0.00269774, 0.00270449,
        0.00270449, 0.00269774, 0.00268429, 0.00266423, 0.00263773,
        0.00260497, 0.0025662 , 0.00252169, 0.00247176, 0.00241678],
       [0.00240473, 0.00245944, 0.00250911, 0.0025534 , 0.00259198,
        0.00262458, 0.00265095, 0.0026709 , 0.00268429, 0.002691  ,
        0.002691  , 0.00268429, 0.0026709 , 0.00265095, 0.00262458,
        0.00259198, 0.0025534 , 0.00250911, 0.00245944, 0.00240473],
       [0.00238677, 0.00244107, 0.00249037, 0.00253432, 0.00257262,
        0.00260497, 0.00263115, 0.00265095, 0.00266423, 0.0026709 ,
        0.0026709 , 0.00266423, 0.00265095, 0.00263115, 0.00260497,
        0.00257262, 0.00253432, 0.00249037, 0.00244107, 0.00238677],
       [0.00236302, 0.00241678, 0.00246559, 0.00250911, 0.00254703,
        0.00257906, 0.00260497, 0.00262458, 0.00263773, 0.00264433,
        0.00264433, 0.00263773, 0.00262458, 0.00260497, 0.00257906,
        0.00254703, 0.00250911, 0.00246559, 0.00241678, 0.00236302],
       [0.00233368, 0.00238677, 0.00243497, 0.00247795, 0.00251539,
        0.00254703, 0.00257262, 0.00259198, 0.00260497, 0.00261149,
        0.00261149, 0.00260497, 0.00259198, 0.00257262, 0.00254703,
        0.00251539, 0.00247795, 0.00243497, 0.00238677, 0.00233368],
       [0.00229894, 0.00235124, 0.00239873, 0.00244107, 0.00247795,
        0.00250911, 0.00253432, 0.0025534 , 0.0025662 , 0.00257262,
        0.00257262, 0.0025662 , 0.0025534 , 0.00253432, 0.00250911,
        0.00247795, 0.00244107, 0.00239873, 0.00235124, 0.00229894],
       [0.00225907, 0.00231046, 0.00235712, 0.00239873, 0.00243497,
        0.00246559, 0.00249037, 0.00250911, 0.00252169, 0.002528  ,
        0.002528  , 0.00252169, 0.00250911, 0.00249037, 0.00246559,
        0.00243497, 0.00239873, 0.00235712, 0.00231046, 0.00225907],
       [0.00221434, 0.00226472, 0.00231046, 0.00235124, 0.00238677,
        0.00241678, 0.00244107, 0.00245944, 0.00247176, 0.00247795,
        0.00247795, 0.00247176, 0.00245944, 0.00244107, 0.00241678,
        0.00238677, 0.00235124, 0.00231046, 0.00226472, 0.00221434],
       [0.00216509, 0.00221434, 0.00225907, 0.00229894, 0.00233368,
        0.00236302, 0.00238677, 0.00240473, 0.00241678, 0.00242283,
        0.00242283, 0.00241678, 0.00240473, 0.00238677, 0.00236302,
        0.00233368, 0.00229894, 0.00225907, 0.00221434, 0.00216509]]

def magicFormula(frameInt, kernel_size = 60):
    pinkness = abs(190 - frameInt[ : , : , 0]) \
                + abs(100 - frameInt[ : , : , 1]) \
                + abs(100 - frameInt[ : , : , 2])
    shadowPinkiness = abs(160 - frameInt[ : , : , 0]) \
                + abs(90 - frameInt[ : , : , 1]) \
                + abs(90 - frameInt[ : , : , 2])
    
#     yellowness = abs(230 - frameInt[ : , : , 0]) \
#                 + abs(140 - frameInt[ : , : , 1]) \
#                 + abs(25 - frameInt[ : , : , 2])
    
    # kernel = np.ones((kernel_size, kernel_size))
    pinknessConfidence = np.minimum(cv2.filter2D(pinkness.astype(np.float32), 1, KERNEL), cv2.filter2D(shadowPinkiness.astype(np.float32), 1, KERNEL)) 
    # pinknessConfidence = cv2.filter2D(pinkness.astype(np.float32), 1, kernel)
    return pinknessConfidence
                
