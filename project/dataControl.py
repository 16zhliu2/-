import os
import re
from codeStyle import codeStyle as CS

directory = []
file_directory = {}
filepath = ""
filefolder = ""
iscodeStyle = False
codeStyle = ""
codeline = 0
codetext = ""
lan = ""


def get_file_list():
    global directory
    dir = "./data"
    directory = []
    for home, dirs, files in os.walk(dir):
        if home == "./data":
            for folder in dirs:
                directory.append({"folderName": folder, "files": []})
        for i in range(len(directory)):
            if home == "./data\\" + directory[i]["folderName"]:
                for file in dirs:
                    directory[i]["files"].append({"filename": file})
    directory = directory
    return directory


def get_file_index(filename):
    global directory, file_directory, filepath, filefolder
    parent_folder = ""
    for folder in directory:
        for file in folder["files"]:
            if file["filename"] == filename:
                parent_folder = folder["folderName"]
                break
        if parent_folder != "":
            break
    filefolder = "./data/" + parent_folder + "/" + filename
    filepath = filefolder + "/" + filename + ".md"
    data = {
        "id": "1",
        "content": filename,
        "type": "text",
        "note": "",
        "children": []
    }
    index01 = -1
    index02 = -1
    index03 = -1
    index04 = -1
    with open(filepath, mode='r', encoding="UTF-8") as f:
        index = 0
        for line in f:
            index += 1
            if re.match(r'^# ', line):
                data["children"].append(
                    {"content": line[1:-1], "children": [], "id": "i", "type": "text", "note":
                        ""})
                index01 += 1
                index02 = -1
            if re.match(r'^## ', line):
                data["children"][index01]["children"].append(
                    {"content": line[2:-1], "children": [], "id": "", "type": "text", "note":
                        "", "lines": index})
                index02 += 1
                index03 = -1
            if re.match(r'^### ', line):
                data["children"][index01]["children"][index02]["children"].append(
                    {"content": line[3:-1], "children": [], "id": "", "type": "text", "note":
                        ""})
                index03 += 1
                index04 = -1
            if re.match(r'^#### ', line):
                data["children"][index01]["children"][index02]["children"][index03]["children"].append(
                    {"content": line[4:-1], "children": [], "id": "", "type": "text", "note":
                        ""})
                index04 += 1
        f.close()
        file_directory = data
        return data


def get_chapter(contentIndex, chapterIndex):
    content = file_directory["children"][int(contentIndex)]["content"]
    chapter = file_directory["children"][int(contentIndex)]["children"][int(chapterIndex)]["content"]
    lines = file_directory["children"][int(contentIndex)]["children"][int(chapterIndex)]["lines"]
    chapter_text = ""
    print("lines", lines)
    with open(filepath, mode='r', encoding="UTF-8") as f:
        index = 0
        flag = False
        for line in f:
            index += 1
            if index == lines:
                flag = True
                chapter_text += str_to_html(line)
                continue
            if flag and (re.match(r'^# ', line) or re.match(r'^## ', line)):
                break
            if flag:
                chapter_text += str_to_html(line)

        chapter = {
            "content": content,
            "text": "<div>%s</div>" % chapter_text
        }
        return chapter


def str_to_html(line):
    global iscodeStyle, codeStyle, codeline, codetext, lan
    if re.match(r'^## ', line):
        line = re.sub(r'^## ', '<h2>', line)
        line = re.sub(r'\n', '</h2>', line)
        return line
    if re.match(r'^### ', line):
        line = re.sub(r'^### ', '<h3>', line)
        line = re.sub(r'\n', '</h3>', line)
        return line
    if re.match(r'^#### ', line):
        line = re.sub(r'^#### ', '<h4>', line)
        line = re.sub(r'\n', '</h4>', line)
        return line
    if line.find("**") != -1:
        line = re.sub(r'\*{2}', '<b>', line, 1)
        line = re.sub(r'\*{2}', '</b>', line, 1)
        return line
    # 代码处理部分
    if re.match(r'^```', line):
        csscode = '<style type="text/css">csscode</style>'
        if not iscodeStyle:
            codetext = ""
            codeline = 0
            codeStyle = '<div style="font-weight:bold;">lan</div>' \
                        '<div class="code_container">coding</div>'

            iscodeStyle = True
        else:
            iscodeStyle = False
            cs = CS()
            css = cs.get_css()
            codetext = cs.translate_code(codetext, lan)
            codetext = re.sub(r'coding', codetext, codeStyle)
            css = re.sub(r'csscode', css, csscode)
            return codetext+css
    if iscodeStyle:
        codeline += 1
        if codeline == 1:
            lanlist = re.findall(r'[a-zA-Z]+', line)
            if len(lanlist) > 0:
                lan = lanlist[0].lower()
                codeStyle = re.sub(r'lan', lan, codeStyle)
        else:
            codetext += line
        return ""
    # 解析图片部分
    if line.count("![im") > 0:
        img = re.findall(r"\(.*?\)", line)
        line = ""
        for src in img:
            line += "<img src='%s' width='500'></img>" % src[1:-1]
        return line
    if line.find("<img") != -1:
        line = '<img %s width="500"/>' % line.split(" ")[1]
        return line
    if line.find('\n') != -1:
        line = re.sub(r'\n', '<br>', line)
        return line

# if __name__ == "__main__":
#     filepath = "./data/前端/Android/疯狂的Android.md"
#     filename = "Android"
#     get_file_index(filepath, filename)
