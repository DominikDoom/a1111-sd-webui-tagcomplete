import requests
from bs4 import BeautifulSoup
import csv
from os import linesep

def read_csv(path):
    csv_data = []
    with open(path, "r+", encoding="UTF8", newline=None) as file:
        csv_data = list(csv.reader(file))
    return csv_data


tag_csv = "./tags/danbooru.csv"
tag_csv_cn = "./tags/danbooru_cn.csv"


url = 'https://wolfchen.top/tag/?from=zhihu'
headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36'}


if __name__ == "__main__":
    r = requests.get(url.strip(), headers=headers, timeout=10)

    soup = BeautifulSoup(r.text, 'html.parser')

    tags = soup.select(".layui-form > input[name=tag]")
    tags = [x['title'].strip('\r\n') for x in tags]

    csv_list = read_csv(tag_csv)
    csv_size = len(csv_list)

    for i in range(len(csv_list)):
        if len(csv_list[i]) == 3:
            continue
        for t in tags:
            if t.startswith(csv_list[i][0]):
                csv_list[i].append(t.replace(csv_list[i][0], ''))
                break


    with open(tag_csv_cn, "w", encoding="UTF8", newline=None) as file:
        writer = csv.writer(file, lineterminator="\n")
        writer.writerows(csv_list)