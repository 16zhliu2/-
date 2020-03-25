# encoding=utf-8
# @content: 知识管理系统服务器函数
# @date: 2019/11/28
# @author: XiaoSheng
from socket import *
import re
import threading
import json
import urllib.parse
import time
import dataControl


def handle_client(client_socket, client_address):
    """为一个客户端服务"""
    # 接收对方发送的数据
    request_time = time.strftime("%Y-%m-%d %H:%M:%S")
    recv_data = client_socket.recv(1024).decode("utf-8")  # 1024表示本次接收的最大字节数
    if recv_data:
        print("\nRequest_time:", request_time)
        print("Connect by:", client_address)
        print("Request is:", recv_data.split('\r\n')[0])
        method = recv_data.split(' ')[0]
        src = recv_data.split(' ')[1]
        src = urllib.parse.unquote(src)

        # 返回浏览器数据
        # 设置内容body
        response_body = ""
        try:
            if method == "GET":
                if src.find('?') != -1:  # 判断是否携带参数
                    entry = src.split('?')[1]
                    response_body = get_data(entry)
                else:
                    file_path = "./web/index.html"
                    if src == '/':  # 即无参数也无文件名
                        file_path = "./web/index.html"
                    elif src.find("image") != -1 or src.find(".jpg") != -1 or src.find(".png") != -1 or src.find(
                            ".gif") != -1:
                        file_path = dataControl.filefolder + src
                    elif src != '':  # 有文件路径
                        file_path = "./web" + src
                    response_body = get_file(file_path)

            elif method == "POST":
                form = recv_data.split('\r\n')
                entry = form[-1]  # 获得请求的data
                response_body = get_data(entry)
        except Exception as e:
            print(e)
        else:
            print("****************************************************************")

        try:
            # 设置返回的头信息 header
            response_headers = "HTTP/1.1 200 OK\r\n"  # 200 表示找到这个资源
            response_headers += "\r\n"  # 空一行与body隔开

            if response_body:
                # 返回数据给浏览器
                client_socket.send(response_headers.encode("utf-8"))  # 转码utf-8并send数据到浏览器
                client_socket.send(response_body)  # 转码utf-8并send数据到浏览器

        except Exception as e:
            # 如果没有找到文件，那么就打印404 not found
            # 设置返回的头信息 header
            print("except", e)
            response_headers = "HTTP/1.1 404 not found\r\n"  # 200 表示找到这个资源
            response_headers += "\r\n"  # 空一行与body隔开
            response_body = "<h1>sorry,file not found</h1>"
            response = response_headers + response_body
            client_socket.send(response.encode("utf-8"))

        client_socket.close()


def get_file(file_path):
    # 读取html文件内容
    file_name = file_path  # 设置读取的文件路径
    f = open(file_name, "rb")  # 以二进制读取文件内容
    response_body = f.read()
    f.close()
    return response_body


def get_data(entry):
    entry = urllib.parse.unquote(entry)
    print(entry)
    param = dict()
    b = re.findall(r'\w+=\w+', entry)
    param.clear()
    # 解析参数
    for item in b:
        dict_item = {item.split("=")[0]: item.split("=")[1]}
        param.update(dict_item)
    print("param:", param)

    response_body = ""

    if param and "command" in param.keys():
        if param['command'] == 'initData':
            directory = dataControl.get_file_list()
            response_body = json.dumps(directory).encode()
        if param['command'] == 'getFile':
            filename = param["filename"]
            file_directory = dataControl.get_file_index(filename)
            response_body = json.dumps(file_directory).encode()
        if param['command'] == 'getChapter':
            chapter = dataControl.get_chapter(param["contentIndex"], param["chapterIndex"])
            response_body = json.dumps(chapter).encode()
        return response_body


def main():
    # 创建套接字
    server_socket = socket(AF_INET, SOCK_STREAM)
    # 设置当服务器先close 即服务器端4次挥手之后资源能够立即释放，这样就保证了，下次运行程序时 可以立即绑定7788端口
    server_socket.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
    # 设置服务端提供服务的端口号
    server_socket.bind(('', 2323))
    # 使用socket创建的套接字默认的属性是主动的，使用listen将其改为被动，用来监听连接
    server_socket.listen(88)  # 最多可以监听128个连接
    # 开启while循环处理访问过来的请求
    while True:
        # 如果有新的客户端来链接服务端，那么就产生一个新的套接字专门为这个客户端服务
        # client_socket用来为这个客户端服务
        # server_socket就可以省下来专门等待其他新的客户端连接while True:
        client_socket, client_address = server_socket.accept()
        t = threading.Thread(target=handle_client, args=(client_socket, client_address))
        t.start()


if __name__ == "__main__":
    main()

'''
post command = initData 返回的json数据格式
directory = 
[
    {
        "folderName": "",
        "files": [
            {"filename": "js"},
        ]
    },
]
post command = getFile 返回的json数据格式
fileDirectory =
{
    "content": "预备知识",
    "children": [
        {
            "content": "HTML & CSS",
            "children": [<children>]
        }
    ]
}
'''
