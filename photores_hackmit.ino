const int goal1_A = A0;
const int goal2_A = A2;

int value_goal1A;
int value_goal2A;
int goal1_avg;
int goal2_avg;
int goal1_tempsum = 0;
int goal2_tempsum = 0;
int counter;

void setup() {
  
pinMode (goal1_A, INPUT);
pinMode (goal2_A, INPUT);

Serial.begin(9600);


/*Averaging function to establish a baseline for Analog values*/
counter = 0;
while (counter < 256){
  goal1_tempsum = goal1_tempsum + analogRead(goal1_A);
  goal2_tempsum = goal2_tempsum + analogRead(goal2_A);

  counter = counter + 1 ;
}

goal1_avg = goal1_tempsum /counter;
goal2_avg = goal2_tempsum / counter;


}

void loop() {


value_goal1A = analogRead(goal1_A);
value_goal2A = analogRead(goal2_A);

if (value_goal1A < (goal1_avg - 5)){
  Serial.println("Goal 1 Goal!");
}

if (value_goal2A < (goal2_avg - 5)){
  Serial.println("Goal 2 Goal!");
}

/*
Serial.println(value_goal2A);
Serial.println(value_goal1A);
*/


delay (25);

}
