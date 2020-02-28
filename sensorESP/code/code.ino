#include <DallasTemperature.h>
#include <OneWire.h>

#define ONE_WIRE_BUS D4                          //D2 pin of nodemcu

OneWire oneWire(ONE_WIRE_BUS);
 
DallasTemperature sensors(&oneWire);            // Pass the oneWire reference to Dallas Temperature.

void setup(void)
{
  Serial.begin(9600); 
  sensors.begin();
}

void loop(void)
{ 
  sensors.requestTemperatures();                // Send the command to get temperatures  
  Serial.println(String(sensors.getTempFByIndex(0)) +"," + String(sensors.getTempFByIndex(1)));   // Why "byIndex"? You can have more than one IC on the same bus. 0 refers to the first IC on the wire
  delay(500);
}
