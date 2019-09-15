#https://firebase.google.com/docs/firestore/quickstart
# for permissions: https://cloud.google.com/docs/authentication/getting-started -> create a service account (I created one
# and got a .JSON key called FoosRank-2e45778c2820)


#Steps:
#commamd line: sudo pip install firebase-admin
#created service account and got .JSON key
#command line: export GOOGLE_APPLICATION_CREDENTIALS="[PATH]"
	# eg export GOOGLE_APPLICATION_CREDENTIALS="/Users/maddyz/Downloads/FoosrankRaspberryPi/FoosRank-2e45778c2820.json"
#   # note: must run this every terminal session

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

yellow_div_score = 0 # TODO: need to update based on results from Arduino
black_div_score = 0

def blackDivScored(black_div_score, yellow_div_score):
	#### NOTE: putting this in the players_current_game collection caused an error
	# ("undefined" player showed up in waiting area) so we're not doing that lmao
	black_div_score += 1
	doc_ref = db.collection(u'raspberry_pi_input').document(u'fake_button_presses')
	doc_ref.set({
	    u'fake_yellow_div_score': yellow_div_score,
	    u'fake_black_div_score': black_div_score
	})

def yellowDivScored(black_div_score, yellow_div_score):
	#### NOTE: putting this in the players_current_game collection caused an error
	# ("undefined" player showed up in waiting area) so we're not doing that lmao
	yellow_div_score += 1
	doc_ref = db.collection(u'raspberry_pi_input').document(u'fake_button_presses')
	doc_ref.set({
	    u'raspberry_yellow_div_score': yellow_div_score,
	    u'raspberry_black_div_score': black_div_score
	})

# Use the application default credentials
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
  'projectId': 'foosrank-9e12f',
})

def endGame():
	yellow_div_score = 0
	black_div_score = 0
	doc_ref = db.collection(u'raspberry_pi_input').document(u'fake_button_presses')
	doc_ref.set({
	    u'raspberry_yellow_div_score': 0,
	    u'raspberry_black_div_score': 0
	})


db = firestore.client()

blackDivScored(black_div_score, yellow_div_score)
#yelloDivScored() #TODO: put these when the score is changed

#endGame() #TODO:

# pi => server (exact same function as score points)