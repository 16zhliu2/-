/**
 * @content 拓扑图脚本
 * @author  XiaoSheng
 * @date    2020/02/24
 * @version 1.5
 */

/**
 * @content 画布对象
 * @param   ele canvas的实例元素
 */
function Canvas(ele, data) {
    // canvas属性
    this.canvas = ele;
    this.canvas.height = Math.round(getNodeHeight(data) * 1.5);
    this.canvas.width = 1024;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.data = data;
    this.ctx = this.canvas.getContext('2d');
    // 节点、连线对象容器
    this.nodeList = [];
    this.edgeList = [];
    this.deep = 0;
    this.itemSpaceWidth = 0;
    // 节点属性
    this.textNodeH = 30;
    this.imageNodeH = 160;
    this.circleNodeH = 60;
    this.nodeColor = "#666666";
    this.noteObject = null;
    // canvas事件属性
    this.clickNode = null;
    this.clickFunction = null;
    // 布局样式
    this.layoutStyle = "LAYOUT_LINE_LEFT_TO_RIGHT";
    this.LAYOUT_LINE_LEFT_TO_RIGHT = "LAYOUT_LINE_LEFT_TO_RIGHT";
    this.LAYOUT_LINE_RIGHT_TO_LEFT = "LAYOUT_LINE_RIGHT_TO_LEFT";
    this.LAYOUT_LINE_CENTER_TO_AROUND = "LAYOUT_LINE_CENTER_TO_AROUND";
    this.LAYOUT_NODE_ABOVE_EDGE = "LAYOUT_NODE_ABOVE_EDGE";
    this.LAYOUT_ROOT_NODE_CENTER = "LAYOUT_ROOT_NODE_CENTER";
    this.LAYOUT_STAR_CENTER = "LAYOUT_STAR_CENTER";
    // 线条样式
    this.edgeStyle = "EDGE_CURVE_LR";
    this.EDGE_CURVE_LR = "EDGE_CURVE_LR";
    this.EDGE_CURVE_RL = "EDGE_CURVE_RL";
    this.EDGE_HORIZONTAL_LR = "EDGE_HORIZONTAL_LR";
    this.EDGE_LINE = "EDGE_LINE";
    // 节点样式
    this.nodeStyle = "NODE_RECT_LR";
    this.NODE_RECT_LR = "NODE_RECT_LR";
    this.NODE_RECT_RL = "NODE_RECT_RL";
    this.NODE_ABOVE_EDGE = "NODE_ABOVE_EDGE";
    this.NODE_CIRCLE_NODE = "NODE_CIRCLE_NODE";
    // 设置布局样式
    this.setLayoutStyle = function (layoutStyle) {
        this.layoutStyle = layoutStyle;
        if (layoutStyle === this.LAYOUT_LINE_LEFT_TO_RIGHT) {
            this.nodeStyle = this.NODE_RECT_LR;
            this.edgeStyle = this.EDGE_CURVE_LR;
        }
        if (layoutStyle === this.LAYOUT_LINE_RIGHT_TO_LEFT) {
            this.nodeStyle = this.NODE_RECT_RL;
            this.edgeStyle = this.EDGE_CURVE_RL;
        }
        if (layoutStyle === this.LAYOUT_NODE_ABOVE_EDGE) {
            this.nodeStyle = this.NODE_ABOVE_EDGE;
            this.edgeStyle = this.EDGE_HORIZONTAL_LR;
        }
        if (layoutStyle === this.LAYOUT_STAR_CENTER) {
            this.nodeStyle = this.NODE_CIRCLE_NODE;
            this.edgeStyle = this.EDGE_LINE;
        }
        if (layoutStyle === this.LAYOUT_LINE_CENTER_TO_AROUND) {
            this.canvas.width = this.canvas.width * 1.5;
            this.width = this.canvas.width;
        }
    };
    // 设置节点的样式--后面拓展成使用API动态创建不同样式的节点
    this.setNodeStyle = function (nodeStyle) {
        this.nodeStyle = nodeStyle;
    };
    // 设置线条样式--后面拓展成使用API动态创建不同样式的线条
    this.setEdgeStyle = function (edgeStyle) {
        this.edgeStyle = edgeStyle;
    };
    // 设置节点颜色
    this.setNodeColor = function (color) {
        this.nodeColor = color;
    };
    this.addNode = function (node) {
        this.nodeList.push(node);
    };
    this.addEdge = function (edge) {
        this.edgeList.push(edge);
    };
    this.clearCanvas = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    // 将容器里的色块全部渲染到canvas
    this.painting = function () {
        if (this.layoutStyle === "LAYOUT_STAR_CENTER") {
            buildStarRootNode(this);
        } else {
            buildTreeRootNode(this);
        }
        this.clearCanvas();
        this.nodeList.forEach(ele => {
            renderingNode(this, ele);
        });
        this.edgeList.forEach(ele => {
            renderingEdge(this, ele);
        });
    };
    this.addClickFunction = function (f) {
        this.clickFunction = f;
    };
    // 鼠标点击事件
    this.canvas.addEventListener('mousedown', (e) => {
        const x = e.offsetX;
        const y = e.offsetY;
        console.log("坐标", x, y);
        // 这里将点击的坐标传给所有色块，根据边界判断方法判断是否在点击在内部。是的话执行色块的事件方法。
        this.nodeList.forEach(ele => {
            if (ele.checkBoundary(x, y)) {
                console.log(ele);
                if (this.clickFunction !== null) {
                    this.clickFunction();
                }
                ele.mousedownEvent(this);
            }
        })
    });
    // 鼠标移动事件
    this.canvas.addEventListener('mousemove', (e) => {
        const x = e.offsetX;
        const y = e.offsetY;
        if (this.noteObject != null) {
            document.body.removeChild(this.noteObject);
            this.noteObject = null;
        }
        this.nodeList.forEach(ele => {
            if (ele.checkBoundary(x, y)) {
                let noteObject = document.createElement("div");
                this.noteObject = noteObject;
                ele.mousemoveEvent(e.clientX, e.clientY, noteObject);
            }
        });
    });

}

/**
 * @content 绘制节点
 * @param canvas
 * @param node
 */
function renderingNode(canvas, node) {
    canvas.ctx.font = "12px Arial";
    canvas.ctx.strokeStyle = node.color;
    canvas.ctx.fillStyle = "#000000";
    canvas.ctx.textAlign = "center";
    if (node.nodeStyle === canvas.NODE_RECT_LR || node.nodeStyle === canvas.NODE_RECT_RL) {
        canvas.ctx.strokeRect(node.x, node.y, node.w, node.h);
        canvas.ctx.fillText(node.text, (node.x + node.w / 2), (node.y + node.h / 2 + 5));
    }
    if (node.nodeStyle === canvas.NODE_ABOVE_EDGE) {
        canvas.ctx.beginPath();
        if (node.contentType === "text") {
            canvas.ctx.moveTo(node.x, node.y + node.h / 2);
            canvas.ctx.lineTo(node.x + node.w, node.y + node.h / 2);
            canvas.ctx.stroke();
            canvas.ctx.fillStyle = "#000000";
            canvas.ctx.textAlign = "start";
            canvas.ctx.fillText(node.text, node.x, (node.y + 5));
        }
        if (node.contentType === "image") {
            let img = new Image();
            img.src = node.text;
            img.onload = function () {
                let proportion = img.width / img.height;
                canvas.ctx.drawImage(img, node.x, node.y - (canvas.imageNodeH - 5) + node.h / 2, (canvas.imageNodeH - 10) * proportion, canvas.imageNodeH - 10);
                canvas.ctx.moveTo(node.x, node.y + node.h / 2);
                canvas.ctx.lineTo(node.x + (canvas.imageNodeH - 10) * proportion + 20, node.y + node.h / 2);
                canvas.ctx.stroke();
            }
        }
    }
    if (canvas.nodeStyle === "NODE_CIRCLE_NODE") {
        canvas.ctx.beginPath();
        canvas.ctx.arc(node.x, node.y, node.w / 2, 0, 2 * Math.PI);
        canvas.ctx.stroke();
        canvas.ctx.fillStyle = "#000000";
        canvas.ctx.textAlign = "center";
        canvas.ctx.fillText(node.text, node.x, node.y);
    }
}

/**
 * @content 绘制线条
 * @param canvas 画布对象
 * @param edge
 */
function renderingEdge(canvas, edge) {
    canvas.ctx.beginPath();
    if (edge.edgeStyle === canvas.EDGE_CURVE_LR) {
        canvas.ctx.moveTo(edge.firstX + edge.firstNode.w / 2, edge.firstY);
        canvas.ctx.bezierCurveTo(edge.firstX + (edge.secondX - edge.firstX) * 0.5, edge.firstY, edge.secondX - (edge.secondX - edge.firstX) * 0.5, edge.secondY, edge.secondX - edge.secondNode.w / 2, edge.secondY);
        canvas.ctx.stroke();
    }
    if (edge.edgeStyle === canvas.EDGE_CURVE_RL) {
        canvas.ctx.moveTo(edge.firstX - edge.firstNode.w / 2, edge.firstY);
        canvas.ctx.bezierCurveTo(edge.firstX + (edge.secondX - edge.firstX) * 0.5, edge.firstY, edge.secondX - (edge.secondX - edge.firstX) * 0.5, edge.secondY, edge.secondX + edge.secondNode.w / 2, edge.secondY);
        canvas.ctx.stroke();
    }
    if (edge.edgeStyle === canvas.EDGE_HORIZONTAL_LR) {
        let point = 0.0;
        let firstNodeRightX = edge.firstX + edge.firstNode.w / 2;
        let secondNodeLeftX = edge.secondX - edge.secondNode.w / 2;
        let width = secondNodeLeftX - firstNodeRightX;
        if (canvas.nodeStyle === canvas.NODE_RECT_LR) {
            point = 0.5;
        }
        if (canvas.nodeStyle === canvas.NODE_ABOVE_EDGE) {
            point = 0.8;
        }
        canvas.ctx.beginPath();
        canvas.ctx.lineJoin = "round";
        canvas.ctx.moveTo(firstNodeRightX, edge.firstY);
        canvas.ctx.lineTo(firstNodeRightX + width * point, edge.firstY);
        canvas.ctx.lineTo(secondNodeLeftX - width * (1 - point), edge.secondY);
        canvas.ctx.lineTo(secondNodeLeftX, edge.secondY);
        canvas.ctx.stroke();
    }
}

/**
 * @content 节点对象
 * @param    option={x,y,w,h,text,color} 节点的属性，包括坐标，矩形长宽，填充文本，颜色等
 */
function Node(option) {
    // 初始化设置色块相关属性
    this.id = option.id;
    this.w = option.w;
    this.h = option.h;
    this.x = option.x;
    this.y = option.y;
    this.text = option.text;
    this.contentType = option.contentType;
    this.color = option.color;
    this.note = option.note;
    this.nodeStyle = option.nodeStyle;
    // 判断边界方法
    this.checkBoundary = function (x, y) {
        return x > this.x && x < (this.x + this.w) && y > this.y && y < (this.y + this.h);
    };
    this.mousedownEvent = function () {                     // 点击事件
        console.log(`点击了内容为${this.text}的色块`); //这里的触发事件如何进行扩展，加入调用函数？
    };
    // 鼠标移动到节点出现提示文本
    this.mousemoveEvent = function (x, y, note) {
        let newText = document.createTextNode(this.note);
        note.style['background'] = "#11eeff";
        note.style['left'] = x + "px";
        note.style['top'] = y + "px";
        note.style['position'] = "fixed";
        note.style['width'] = "200px";
        note.style['height'] = "max-content";
        note.style['z-index'] = "1000";
        note.style['transition'] = "all 1s ease-in-out";
        note.style['font-size'] = "13px";
        if (this.note.length > 0) { // 存在节点文本才显示提示
            note.style['padding'] = "5px";
        }
        note.style['border-radius'] = "5%";
        note.appendChild(newText);
        document.body.appendChild(note);
    }
}

/**
 * @content 连线对象
 * @param   firstNode 连线的开始节点对象
 * @param   secondNode  连线的结束节点对象
 * @param   edgeStyle 线条的样式
 */
function Edge(firstNode, secondNode, edgeStyle) {
    this.firstNode = firstNode;
    this.secondNode = secondNode;
    this.firstX = firstNode.x + firstNode.w / 2;
    this.firstY = firstNode.y + firstNode.h / 2;
    this.secondX = secondNode.x + secondNode.w / 2;
    this.secondY = secondNode.y + secondNode.h / 2;
    this.edgeStyle = edgeStyle;
}

/**
 * @content 获得该节点为根节点的拓扑树的深度
 * @param   data json格式的数据
 * @return  int 深度
 */
function getDeep(data) {
    if (data.children.length !== 0) {
        let max = 0;
        for (let i = 0; i < data.children.length; i++) {
            max = Math.max(getDeep(data.children[i]), max);
        }
        return max + 1;
    } else {
        return 1;
    }
}

/**
 * @content 获得该节点为根节点的拓扑树紧密排列可能使用的空间高度
 * @param   data json格式的数据
 * @return  int 高度
 */
function getNodeHeight(data) {
    if (data.children.length !== 0) {
        let height = 0;
        for (let i = 0; i < data.children.length; i++) {
            height += getNodeHeight(data.children[i]);
        }
        // 当节点是图片标签的时候，如果容器的矩形空间不足以容纳，则返回定义的最大图片高度
        if (data.type === "image" && height < 160) {
            return 160;
        }
        return height;
    } else {
        if (data.type === "text") {
            return 30;
        }
        if (data.type === "image") {
            return 160;
        }
    }
}

/**
 * @content 创建拓扑图的根节点入口函数
 * @param   canvas 画布对象
 */
function buildTreeRootNode(canvas) {
    let data = canvas.data;
    canvas.deep = getDeep(data);
    canvas.itemSpaceWidth = canvas.width / canvas.deep;
    // 创建根节点
    let rootNodeX = 0, spaceX = 0;
    let rootNodeW = canvas.ctx.measureText(data.content).width;
    if (canvas.layoutStyle === canvas.LAYOUT_LINE_RIGHT_TO_LEFT) {
        spaceX = canvas.width;
        rootNodeX = canvas.width - rootNodeW - 50;
    }
    if (canvas.layoutStyle === canvas.LAYOUT_LINE_LEFT_TO_RIGHT || canvas.layoutStyle === canvas.LAYOUT_NODE_ABOVE_EDGE) {
        rootNodeX = 20;
    }
    if (canvas.layoutStyle === canvas.LAYOUT_LINE_CENTER_TO_AROUND) {
        rootNodeX = canvas.width / 2 - rootNodeW / 2;
    }
    let parentNode = new Node({
        id: 1,
        x: rootNodeX,
        y: canvas.height / 2,
        w: rootNodeW + 30,
        h: canvas.textNodeH,
        color: canvas.nodeColor,
        text: data.content,
        contentType: data.type,
        note: data.note,
        nodeStyle: canvas.nodeStyle
    });
    canvas.addNode(parentNode);
    let option = {
        spaceX: spaceX,
        spaceY: 0,
        spaceW: canvas.itemSpaceWidth,
        spaceH: canvas.height - 50,
    };
    if (canvas.layoutStyle === canvas.LAYOUT_LINE_CENTER_TO_AROUND) {
        buildChildrenTreeRootNode(canvas, data, parentNode, option);
    } else {
        buildChildrenTreeNode(canvas, data, parentNode, 1, option, canvas.nodeStyle, canvas.itemSpaceWidth);
    }
}

/**
 * @content 中心根节点树形拓扑图的二级节点绘制入口
 * @param canvas 画布对象
 * @param data 数据
 * @param parentNode 根节点
 * @param option 根节点的占据空间属性
 */
function buildChildrenTreeRootNode(canvas, data, parentNode, option) {
    let moreSpaceL = 0, moreSpaceR = 0;
    let parentHeight = 0;
    let parentHeightL = 0, parentHeightR = 0;
    for (let i = 0; i < data.children.length; i++) {
        if (i < data.children.length / 2) {
            parentHeightL += getNodeHeight(data.children[i]);
        } else {
            parentHeightR += getNodeHeight(data.children[i]);
        }
    }
    moreSpaceL = (option.spaceH - parentHeightL) / (data.children.length / 2+1);
    moreSpaceR = (option.spaceH - parentHeightR) / (data.children.length / 2+1);
    let spaceYL = 0, spaceYR = 0;
    for (let i = 0; i < data.children.length; i++) {
        parentHeight = getNodeHeight(data.children[i]);
        if (i <= data.children.length / 2) {
            let option = {
                spaceX: canvas.width / 2 - canvas.itemSpaceWidth/2,
                spaceY: spaceYL,
                spaceW: canvas.itemSpaceWidth / 2,
                spaceH: getNodeHeight(data.children[i]) + moreSpaceL
            };
            spaceYL += option.spaceH;
            let node = new Node({
                id: data.children[i].id,
                x: option.spaceX,
                y: option.spaceY + option.spaceH / 2,
                w: canvas.ctx.measureText(data.children[i].content).width + 30,
                h: canvas.textNodeH,
                color: canvas.nodeColor,
                text: data.children[i].content,
                contentType: data.children[i].type,
                note: data.children[i].note,
                nodeStyle: canvas.NODE_RECT_RL
            });
            canvas.addNode(node);
            canvas.addEdge(new Edge(parentNode, node, canvas.EDGE_CURVE_RL));
            buildChildrenTreeNode(canvas, data.children[i], node, 2, option, canvas.NODE_RECT_RL, canvas.itemSpaceWidth / 2);
        } else {
            let option = {
                spaceX: canvas.width / 2 + canvas.itemSpaceWidth/2,
                spaceY: spaceYR,
                spaceW: canvas.itemSpaceWidth / 2,
                spaceH: getNodeHeight(data.children[i]) + moreSpaceR
            };
            spaceYR += option.spaceH;
            let node = new Node({
                id: data.children[i].id,
                x: option.spaceX,
                y: option.spaceY + option.spaceH / 2,
                w: canvas.ctx.measureText(data.children[i].content).width + 30,
                h: canvas.textNodeH,
                color: canvas.nodeColor,
                text: data.children[i].content,
                contentType: data.children[i].type,
                note: data.children[i].note,
                nodeStyle: canvas.NODE_RECT_LR
            });
            canvas.addNode(node);
            canvas.addEdge(new Edge(parentNode, node, canvas.EDGE_CURVE_LR));
            buildChildrenTreeNode(canvas, data.children[i], node, 2, option, canvas.NODE_RECT_LR, canvas.itemSpaceWidth / 2);
        }
    }
}

/**
 * @content 创建节点的所有孩子节点和连线
 * @param   canvas 画布对象
 * @param   data json格式的数据
 * @param   parentNode 子树的根节点
 * @param   level 从根节点到该层的层数
 * @param   option={spaceX, spaceY, spaceW, spaceH} 以该节点为根节点的拓扑图使用空间矩形的参数
 * @param   nodeStyle 节点的样式
 * @param   itemSpaceWidth 节点的占据空间宽度
 */
function buildChildrenTreeNode(canvas, data, parentNode, level, option, nodeStyle, itemSpaceWidth) {
    if (data.children.length !== 0) {
        let moreSpace = 0, spaceX = option.spaceX;
        let parentHeight = getNodeHeight(data);
        // 补充多余的空间，使得布局更加均匀
        if (option.spaceH > parentHeight) {
            moreSpace = (option.spaceH - parentHeight) / data.children.length;
        }
        if (nodeStyle === canvas.NODE_RECT_LR || canvas.nodeStyle === canvas.NODE_ABOVE_EDGE) {
            option.spaceX = option.spaceX + itemSpaceWidth;
        }
        if (nodeStyle === canvas.NODE_RECT_RL) {
            option.spaceX = option.spaceX - itemSpaceWidth;
        }
        for (let i = 0; i < data.children.length; i++) {
            option.spaceH = getNodeHeight(data.children[i]) + moreSpace;
            let nodeAttr = {
                nodeId: data.children[i].id,
                text: data.children[i].content,
                contentType: data.children[i].type,
                note: data.children[i].note,
                nodeStyle: nodeStyle
            };
            let node = buildTreeNodeEdge(canvas, parentNode, option, nodeAttr);
            let newOption = {
                spaceX: option.spaceX,
                spaceY: option.spaceY,
                spaceW: option.spaceW,
                spaceH: option.spaceH
            };
            buildChildrenTreeNode(canvas, data.children[i], node, level + 1, newOption, nodeStyle, itemSpaceWidth);
            option.spaceY += option.spaceH;
        }
    }
}

/**
 * @content 还未完成的星型模式
 * @param canvas
 */
function buildStarRootNode(canvas) {
    canvas.deep = getDeep(canvas.data);
    canvas.itemSpaceWidth = canvas.width / canvas.deep;
    // 创建根节点
    let parentSpaceY = 0;
    let parentNode = new Node({
        id: 1,
        x: canvas.width / 2,
        y: canvas.height / 2,
        w: canvas.circleNodeH,
        h: canvas.circleNodeH,
        text: canvas.data.id,
        contentType: canvas.data.type
    });
    canvas.addNode(parentNode);
    let beginAngle = 3 / 4 * Math.PI;
    buildChildrenStarNode(canvas, canvas.data, parentNode, 1, beginAngle);
}

function buildChildrenStarNode(canvas, data, parentNode, level, beginAngle) {
    let childrenNum = data.children.length;
    if (childrenNum !== 0) {
        let angle = 2 * Math.PI / childrenNum;
        let edgeLength = 200 - level * 45;
        for (let i = 0; i < childrenNum; i++) {
            console.log(data.children[i].id);
            let nodeX = parentNode.x + edgeLength * Math.cos(beginAngle - angle * i);
            let nodeY = parentNode.y - edgeLength * Math.sin(beginAngle - angle * i);
            let node = new Node({
                id: data.children[i].id,
                x: nodeX,
                y: nodeY,
                w: canvas.circleNodeH - 10 * level,
                h: canvas.circleNodeH,
                text: data.children[i].id,
                contentType: data.children[i].type
            });
            canvas.addNode(node);
            canvas.addEdge(new Edge(parentNode, node));
            buildChildrenStarNode(canvas, data.children[i], node, level + 1, beginAngle - angle * i);
        }
    }
}

/**
 * @content 创建节点和连线
 * @param   canvas 画布对象
 * @param   parentNode 连线的出发节点
 * @param   option={spaceX, spaceY, spaceW, spaceH} 以该节点为根节点的拓扑图使用空间矩形的参数
 * @param   nodeAttr 节点的相关属性
 * @return  childNode 返回创建的节点对象
 */
function buildTreeNodeEdge(canvas, parentNode, option, nodeAttr) {
    let nodeH = 0, nodeW = 0, nodeX = 0, edgeStyle = "";
    // 根据不同的节点类型进行宽高的判断
    if (nodeAttr.contentType === "text") {
        nodeH = canvas.textNodeH;
        nodeW = canvas.ctx.measureText(nodeAttr.text).width + 30;
    }
    if (nodeAttr.contentType === "image") {
        nodeH = canvas.imageNodeH;
        let img = new Image();
        img.src = nodeAttr.text;
        img.onload = function () {
            let proportion = img.width / img.height;
            nodeW = (canvas.imageNodeH - 10) * proportion;
        }
    }
    // 根据不同的布局进行坐标定位
    if (nodeAttr.nodeStyle === canvas.NODE_RECT_LR) {
        nodeX = option.spaceX;
        edgeStyle = canvas.EDGE_CURVE_LR;
    }
    if (nodeAttr.nodeStyle === canvas.NODE_ABOVE_EDGE) {
        nodeX = option.spaceX;
        edgeStyle = canvas.EDGE_HORIZONTAL_LR;
    }
    if (nodeAttr.nodeStyle === canvas.NODE_RECT_RL) {
        nodeX = option.spaceX - nodeW;
        edgeStyle = canvas.EDGE_CURVE_RL;
    }
    let childNode = new Node({
        id: nodeAttr.nodeId,
        x: nodeX,
        y: option.spaceY + option.spaceH / 2,
        w: nodeW,
        h: nodeH,
        color: canvas.nodeColor,
        text: nodeAttr.text,
        contentType: nodeAttr.contentType,
        note: nodeAttr.note,
        nodeStyle: nodeAttr.nodeStyle
    });
    canvas.addNode(childNode);
    canvas.addEdge(new Edge(parentNode, childNode, edgeStyle));
    return childNode;
}