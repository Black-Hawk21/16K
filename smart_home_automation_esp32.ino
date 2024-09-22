#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <string.h>
#include "DHT.h"

#define ECHO_PIN1 2  // Echo pin for sensor 1
#define TRIG_PIN1 4  // Trig pin for sensor 1

#define ECHO_PIN2 5  // Echo pin for sensor 2
#define TRIG_PIN2 18 // Trig pin for sensor 2

#define DHTPIN 26
#define DHTTYPE DHT11
#define photoresist 34

#define led 13

const char* ssid = "Blaze";
const char* password = "sigguledharaneeku";

const String channelID = "2665045";
const String readAPIkey = "AXS1PZ2BMIYSSZHX";
const String writeAPIkey = "N7R08OX4IIFHT230";

int people = 0;

unsigned long triggerTime1 = 0;
unsigned long triggerTime2 = 0;
bool doorStatusKnown = false;

HTTPClient http;

int led_status = 0;
int prev_led_status = 3;

DHT dht(DHTPIN, DHTTYPE);

int field1;
int field2;
int field4;

void setup() {
  Serial.begin(115200);
  
  pinMode(LED_BUILTIN, OUTPUT);

  // Sensor 1 pins
  pinMode(TRIG_PIN1, OUTPUT);
  pinMode(ECHO_PIN1, INPUT);

  // Sensor 2 pins
  pinMode(TRIG_PIN2, OUTPUT);
  pinMode(ECHO_PIN2, INPUT);
  pinMode(led, OUTPUT);
  pinMode(12, OUTPUT);
  digitalWrite(led, LOW);

  WiFi.begin(ssid, password);

  // Connect to Wi-Fi
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    // WiFi.begin(ssid, password);
  }
  Serial.println("Connected to Wi-Fi!");

  String read_url = "http://api.thingspeak.com/channels/" + channelID + "/feeds.json?api_key=" + readAPIkey + "&results=1";

  http.begin(read_url);

  dht.begin();

}

// Function to read distance from a specific sensor
float readDistanceCM(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  int duration = pulseIn(echoPin, HIGH);
  return duration * 0.034 / 2;
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {

    int httpCode = http.GET();

    // Read distance from both sensors
    float distance1 = readDistanceCM(TRIG_PIN1, ECHO_PIN1);

    float distance2 = readDistanceCM(TRIG_PIN2, ECHO_PIN2);

    // If sensor 1 detects something close
    if (distance1 < 100 && triggerTime1 == 0) {
      triggerTime1 = millis();  // Record the time sensor 1 was triggered
      Serial.println("Sensor 1 triggered");
    }

    // If sensor 2 detects something close
    if (distance2 < 100 && triggerTime2 == 0) {
      triggerTime2 = millis();  // Record the time sensor 2 was triggered
      Serial.println("Sensor 2 triggered");
    }

    // Determine door status based on which sensor was triggered first
    if (triggerTime1 > 0 && triggerTime2 > 0 && !doorStatusKnown) {
      if (triggerTime1 < triggerTime2) {
        Serial.println("people entered");
        people++;
        Serial.print("people: ");
        Serial.println(people);
        digitalWrite(LED_BUILTIN, HIGH);  // Turn on LED for opening

        
        

      } else {
        Serial.println("people leaving");
        people--;
        people = max(0, people);
        Serial.print("people: ");
        Serial.println(people);
        digitalWrite(LED_BUILTIN, LOW);   // Turn off LED for closing
      }

      

      doorStatusKnown = true;  // Door status is known, don't update anymore

    }

    if (doorStatusKnown && millis() - max(triggerTime1, triggerTime2) > 3000) {
      triggerTime1 = 0;
      triggerTime2 = 0;
      doorStatusKnown = false;
      Serial.println("Ready for next detection.");
    }



    if (httpCode > 0) {

      String payload = http.getString();

      DynamicJsonDocument doc(1024);
      deserializeJson(doc, payload);

      if (doc["feeds"][0]["field1"].as<String>() != "null") {       //led on off
        field1 = doc["feeds"][0]["field1"].as<int>();
      }
      
      if (doc["feeds"][0]["field4"].as<String>() != "null") {       //ac on off
        field4 = doc["feeds"][0]["field4"].as<int>();
      }

      if (doc["feeds"][0]["field2"].as<String>() != "null") {       //ac temp read
        field2 = doc["feeds"][0]["field2"].as<int>();
        field2 = (field2-16)*255/15;
      }

      if (field4 == 1) {
        analogWrite(12, field2);
      }
      else {
        analogWrite(12,0);
      }

      if (people >= 1) {
          led_status = 1;
          digitalWrite(led, HIGH);
          // field1 = 1;
      }

      if (people == 0) {
        digitalWrite(led, LOW);
        led_status = 0;
      }
      
      else if (led_status == 1) {
        if (field1 == 0) {
          digitalWrite(led, LOW);
          led_status = 0;
        }
      }

      else if (led_status == 0) {
        if (field1 == 1) {
          digitalWrite(led, HIGH);
          led_status = 1;
        }
      }


      int brightness = analogRead(photoresist);

      float temp = dht.readTemperature();

      if (prev_led_status != led_status) {
        HTTPClient http2;
        String write_url = "http://api.thingspeak.com/update?api_key=" + writeAPIkey  + "&field1=" + led_status + "&field2=" + doc["feeds"][0]["field2"].as<int>() + "&field3=" + doc["feeds"][0]["field3"].as<int>() + "&field4=" + doc["feeds"][0]["field4"].as<int>() + "&field6=" + temp + "&field7=" + (4100-brightness);
        http2.begin(write_url);
        int httpResponseCode = http2.GET();
        http2.end();
      }

      prev_led_status=led_status;
      
        
      }
    }
    
  delay(100); 
  }


