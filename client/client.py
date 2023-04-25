import psutil
import subprocess
import GPUtil
import socket
import requests
import platform
import os
import re
import json
import time
from dotenv import load_dotenv

load_dotenv()

BACKEND_ENDPOINT = os.getenv('BACKEND_ENDPOINT') + '/hw'
print(f'{BACKEND_ENDPOINT}')
HEADERS = {'Content-type': 'application/json'}
OS_NAME = platform.system()


def get_processor_name():
    if OS_NAME == "Windows":
        return platform.processor()
    elif OS_NAME == "Darwin":
        os.environ['PATH'] = os.environ['PATH'] + os.pathsep + '/usr/sbin'
        command = "sysctl -n machdep.cpu.brand_string"
        return subprocess.check_output(command).strip()
    elif OS_NAME == "Linux":
        command = "cat /proc/cpuinfo"
        all_info = subprocess.check_output(
            command, shell=True).decode().strip()
        for line in all_info.split("\n"):
            if "model name" in line:
                return re.sub(".*model name.*:", "", line, 1)
    return "null"


def get_available_gpu():
    GPUs = GPUtil.getGPUs()
    freeMemory = 0
    available = -1
    for GPU in GPUs:
        if GPU.memoryFree >= freeMemory:
            freeMemory = GPU.memoryFree
            available = GPU.id

    return available


def initialize_client():
    hwInfo = json.dumps({
        'hwName': socket.gethostname(),
        'os': OS_NAME,
        'cpu': get_processor_name(),
        'gpu': get_available_gpu()
    })

    print(f'json: {hwInfo}')

    response = requests.post(
        BACKEND_ENDPOINT + "/createHwInfo", data=hwInfo, headers=HEADERS)
    print(f'{response.status_code}')
    print(f'sent: {response.json()}')
    if (response.status_code == 208):
        return int(response.json()['hwSearched']['hwInfoId'])
    else:
        return int(response.json()['hwInfoId'])


def send_statistics(hwinfoid: int):
    hwStatistics = json.dumps({
        'hwInfoId': hwinfoid,
        'cpuUsage': get_cpu_percent_usage(),
        'cpuTemperature': get_cpu_temperatures(),
        'gpuUsage': -1,
        'programInUse': get_program_with_highest_cpu_usage()
    })

    print(f'{hwStatistics}')

    response = requests.post(
        BACKEND_ENDPOINT + "/createHwStatistics", data=hwStatistics, headers=HEADERS)
    print(f'{response.status_code}')
    print(f'sent: {response.json()}')


def get_gpu_usage():
    output = subprocess.check_output(['nvidia-smi'])
    output_str = output.decode('utf-8')
    lines = output_str.split('\n')

    for line in lines:
        if '%' in line:
            words = line.split()
            gpu_usage = words[2]
            if (gpu_usage.isdigit()):
                return int(gpu_usage)
            else:
                return -1


def get_program_with_highest_cpu_usage():
    processes = psutil.process_iter()
    highest_cpu_usage = -1.0
    highest_cpu_usage_program = ''

    for process in processes:
        try:
            cpu_usage = process.cpu_percent()

            if cpu_usage > highest_cpu_usage:
                highest_cpu_usage = cpu_usage
                highest_cpu_usage_program = process.name()
        except psutil.NoSuchProcess:
            pass

    return highest_cpu_usage_program


def get_cpu_percent_usage():
    return int(psutil.cpu_percent(interval=1))


def get_cpu_temperatures():
    if OS_NAME == "Linux":
        stringTemp = str(psutil.sensors_temperatures())
        INIT = stringTemp.find('current', stringTemp.find(
            'coretemp'), stringTemp.__len__())
        temp = stringTemp[INIT + 8:INIT + 8 + 2]
        if (temp.isdigit()):
            return int(temp)
        else:
            return -1
    else:
        return -1


def get_memory_percent_usage():
    memory_info = psutil.virtual_memory()
    return memory_info.percent


def main():
    try:
        hwinfoid = initialize_client()
    except requests.exceptions.Timeout as err:
        print(f'{err}')
    except requests.exceptions.TooManyRedirects as err:
        print(f'{err}')
    except requests.exceptions.RequestException as err:
        print(f'{err}')

    while (True):
        try:
            send_statistics(hwinfoid)
        except requests.exceptions.Timeout as err:
            print(f'{err}')
        except requests.exceptions.TooManyRedirects as err:
            print(f'{err}')
        except requests.exceptions.RequestException as err:
            print(f'{err}')
        time.sleep(10)


if __name__ == "__main__":
    main()
