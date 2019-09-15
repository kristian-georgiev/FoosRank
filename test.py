import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

from picamera.array import PiRGBArray
from picamera import PiCamera
import time
import cv2

from ballz import markFrame

class Pi:

  def __init__(self, max_buffer_size, framerate, resolution):

    # Initialize Constants
    self.START_STATE = 0
    self.PLAY_STATE = 1
    self.END_STATE = 2

    # Initialize given parameters
    self.max_buffer_size = max_buffer_size
    self.framerate = framerate
    self.resolution = resolution

    # Initialize Camera Stuff
    self.camera = PiCamera(framerate=self.framerate, resolution=self.resolution)
    self.raw_capture = PiRGBArray(self.camera, size=self.resolution)

    self.replay_delay = 20000//self.camera.framerate
    self.current_state = self.START_STATE
    self.frame_buffer = []

    self.yellow_score = 0
    self.black_score = 0

    self.previous_x = None
    self.previous_y = None

    time.sleep(1) # give the camera time to warm up

  def find_ball(self, frame):

    # Returns point of ball in the frame
    return (-1, -1)

  def buffer_add_frame(self, frame):

    self.frame_buffer.append(frame.copy())
    if len(self.frame_buffer) > self.max_buffer_size:
      self.frame_buffer.pop(0)

  def replay_buffer(self):

    for frame in self.frame_buffer:
      cv2.namedWindow("Frame", cv2.WND_PROP_FULLSCREEN)
      cv2.setWindowProperty("Frame", cv2.WND_PROP_FULLSCREEN, cv2.cv.CV_WINDOW_FULLSCREEN)
      cv2.imshow("Frame", frame)
      cv2.waitKey(self.replay_delay)

    self.frame_buffer[:] = []

  def start(self):
    last_position = (0, 0)

    for frame in self.camera.capture_continuous(self.raw_capture, format="bgr", use_video_port=True):
      image = frame.array

      print(image.size)
      print(image)
      print(type(image))
      print(image.dtype)

      marked_image, last_position = markFrame(image, 32, last_position)

      self.buffer_add_frame(marked_image)

      (ball_x, ball_y) = self.find_ball(frame)

      if (ball_x, ball_y) == (-1, -1):

        if self.current_state == self.START_STATE: # keep waiting for ball to enter the game
          pass

        elif self.current_state == self.PLAY_STATE: # goal was recorded
          # TODO fix this
          max_score = max(self.black_score, self.yellow_score)
          min_score = min(self.black_score, self.yellow_score)

          if max_score >= 10:
            if max_score - min_score >= 2:
	      # finish the game
              self.current_state = self.END_STATE
              pass

          self.replay_buffer() # for cool effects
          self.current_state = self.START_STATE

      else:
        self.previous_x = ball_x
        self.previous_y = ball_y

      # TODO potentially also show the image
      cv2.namedWindow("Frame", cv2.WND_PROP_FULLSCREEN)
      cv2.setWindowProperty("Frame", cv2.WND_PROP_FULLSCREEN, cv2.cv.CV_WINDOW_FULLSCREEN)
      cv2.imshow("Frame", marked_image)
      key = cv2.waitKey(1) & 0xFF

      self.raw_capture.truncate(0)

      if key == ord("r"):
        self.replay_buffer()

      if key == ord("q"):
        self.replay_buffer()
        break

yellow_div_score = 0 # TODO: need to update based on results from Arduino
black_div_score = 0

def blackDivScored(black_div_score):
  # NOTE: putting this in the players_current_game collection caused an error
  # ("undefined" player showed up in waiting area) so we're not doing that lmao
  black_div_score += 7
  doc_ref = db.collection(u'raspberry_pi_input').document(u'black')
  doc_ref.set({u'raspberry_black_div_score': black_div_score})

def yellowDivScored(yellow_div_score):
  #### NOTE: putting this in the players_current_game collection caused an error
  # ("undefined" player showed up in waiting area) so we're not doing that lmao
  yellow_div_score += 2
  doc_ref = db.collection(u'raspberry_pi_input').document(u'yellow')
  doc_ref.set({u'raspberry_yellow_div_score': yellow_div_score})

# Use the application default credentials
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
  'projectId': 'foosrank-9e12f',
})

def endGame():
  yellow_div_score = 0
  black_div_score = 0
  black_ref = db.collection(u'raspberry_pi_input').document(u'black')
  black_ref.set({u'raspberry_black_div_score': 0})
  yellow_ref = db.collection(u'raspberry_pi_input').document(u'yellow')
  yellow_ref.set({u'raspberry_yellow_div_score': 0})

db = firestore.client()

blackDivScored(black_div_score)
yellowDivScored(yellow_div_score)
#yelloDivScored() #TODO: put these when the score is changed

#endGame() #TODO:

# pi => server (exact same function as score points)


pi = Pi(40, 80, (640, 480))
pi.start()
