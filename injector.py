import requests
import xml.etree.ElementTree as ET
import json
import time

def get_weather_data():
    url = "https://www.aemet.es/xml/municipios_h/localidad_h_12012.xml"
    response = requests.get(url)

    if response.status_code == 200:
        root = ET.fromstring(response.text)
        timestamp = root.find('.//elaborado').text
        relevant_data = {'timestamp': timestamp, 'temperature_data': []}
        first_day = root.find('.//prediccion/dia[1]')

        for temperature_elem in first_day.findall('.//temperatura'):
            hour = int(temperature_elem.get('periodo'))
            temperature = float(temperature_elem.text)
            relevant_data['temperature_data'].append({'hour': hour, 'temperature': temperature})

        return relevant_data

    return None


def store_data_in_object_storage(data):
    object_storage_url = "http://object-storage:8585/store"
    
    try:
        response = requests.post(object_storage_url, json=data)
        response.raise_for_status()
        print("Data stored in object storage successfully.")
    except requests.exceptions.RequestException as e:
        print(f"Error storing data in object storage: {e}")


def main():

    while True:
        weather_data = get_weather_data()

        if weather_data:
            store_data_in_object_storage(weather_data)

        time.sleep(900)

if __name__ == "__main__":
    main()