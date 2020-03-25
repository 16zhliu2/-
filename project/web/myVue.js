/**
 * @content Vue的总体框架
 * @anthor XiaoSheng
 * @date 2020/02/17
 * @version 0.2
 * @type {Vue}
 */
new Vue({
    el: "#body_container",
    data() {
        return {
            directory: null,
            files: null,
            fileTitle: "",
            fileDirectory: null,
            canvasData: null,
            selectedIndex: [0, 0], // 文件的目录是二维的，一级是章节目录，二级是章小节
            textPanelText: "<p>文本内容</p>",
            panelStack: [], // 使用该序列控制panel的打开关闭
            mapPanelRight: {'right': '-80%'},
            textPanelRight: {'right': '-67%'},
            canvas:null,
            netList: [
                {
                    "name": "菜鸟教程",
                    "src": "https://www.runoob.com/"
                },
                {
                    "name": "51CTO",
                    "src": "https://cn.vuejs.org/"
                },
                {
                    "name": "Vue.js",
                    "src": "https://www.51cto.com/"
                },
                {
                    "name":"W3school",
                    "src":"https://www.w3school.com.cn/"
                }
            ]
        }
    },
    created: function () {
        this.getData();
    },
    mounted() {
        /* 监听窗口尺寸打变化 */
        $(window).resize(() => {
            this.addCanvas(this.canvasData); // 监听页面变化，动态的删除旧画布，重新添加画布和绘制
            this.textScrollHeight = {'height': $("#text_container").height()};
        });
    },
    methods: {
        chooseFolder: function (folder, index) {
            this.files = this.directory[index].files;
        },
        chooseFile: function (file, index) {
            let requestField = {
                "command": "getFile",
                "filename": file.filename
            };
            let result = getJSONData(requestField);
            this.canvasData = result;
            this.fileTitle = result.content;
            this.fileDirectory = result.children;
            /* 打开第二层页面 */
            this.mapPanelRight = {'right': '0'};
            if (this.panelStack.length === 0 ) {
                this.panelStack.push("#map_panel");
            }
            this.addCanvas(this.canvasData);
            if (this.panelStack[this.panelStack.length-1]=== "#text_panel"){
                this.closeTextPanel();
            }
        },
        chooseNet:function(netItem,index){
            window.open(netItem.src);
        },
        /**
         * @content 选择章节
         * @param itemIndex
         * @param index
         */
        chooseChapter: function (itemIndex, index) {
            this.selectedIndex[0] = itemIndex;
            this.selectedIndex[1] = index;
            this.textPanelRight = {'right': '0'};
            // 文件目录是二维的，从小节到另一个章节的另一个小节
            if (this.panelStack.length === 0 || (this.panelStack.length > 0 && this.panelStack[this.panelStack.length - 1] !== "#text_panel")) {
                this.panelStack.push("#text_panel");
            }
            this.getChapter();
        },
        chooseLastChapter: function () {
            // 文件目录是二维的，从小节到上一个章节的另一个小节
            if (this.selectedIndex[1] === 0) {
                this.selectedIndex[0] -= 1;
                this.selectedIndex[1] = this.fileDirectory[this.selectedIndex[0]].children.length - 1;
            } else {
                this.selectedIndex[1] -= 1;
            }
            this.getChapter();
        },
        chooseNextChapter: function () {
            // 文件目录是二维的，从小节到下一个章节的另一个小节
            if (this.selectedIndex[1] === this.fileDirectory[this.selectedIndex[0]].children.length - 1) {
                this.selectedIndex[0] += 1;
                this.selectedIndex[1] = 0;
            } else {
                this.selectedIndex[1] += 1;
            }
            this.getChapter();
        },
        getChapter: function () {
            let requestField = {
                "command": "getChapter",
                "fileName": this.fileTitle,
                "contentIndex": this.selectedIndex[0],
                "chapterIndex": this.selectedIndex[1],
            };
            let result = getJSONData(requestField);
            if (result !== null) {
                this.textPanelText = result.text;
            }
            if (this.selectedIndex[0] === 0 && this.selectedIndex[1] === 0) {
                $(".last_chapter").hide();
            } else {
                $(".last_chapter").show();
            }
            if (this.selectedIndex[0] === this.fileDirectory.length - 1 && this.selectedIndex[1] === this.fileDirectory[-1].children.length - 1) {
                $(".next_chapter").hide();
            } else {
                $(".next_chapter").show();
            }
        },
        /**
         * @content 动态添加的canvas
         * @param canvasData 绘制拓扑图的的数据
         */
        addCanvas: function (canvasData) {
            if (this.canvas !== null){
                $("#canvasContainer").empty();
                this.canvas =null;
            }
            this.canvas = document.createElement("canvas");
            this.canvas.class = "canvasClass";
            $("#canvasContainer").append(this.canvas);
            let MyCanvas = new Canvas(this.canvas, canvasData);
            MyCanvas.setLayoutStyle(MyCanvas.LAYOUT_LINE_LEFT_TO_RIGHT);
            MyCanvas.addClickFunction(null);
            MyCanvas.addClickFunction(f);
            MyCanvas.painting();
            // console.log(MyCanvas.height, MyCanvas.width);
        },
        /**
         * @content 首页加载获取初始数据
         */
        getData: function () {
            console.log("start getData");
            let RequestField = {
                "command": "initData"
            };
            let result = getJSONData(RequestField);
            this.directory = result;
            this.files = result[0].files;
        },
        closeMapPanel: function () {
            if (this.panelStack[this.panelStack.length - 1] === "#map_panel") {
                this.mapPanelRight = {'right': '-80%'};
                this.panelStack.pop();
                $("#canvasContainer").empty();
            }
        },
        closeTextPanel: function () {
            console.log(this.panelStack);
            if (this.panelStack[this.panelStack.length - 1] === "#text_panel") {
                this.textPanelRight = {'right': '-67%'};
                this.panelStack.pop();
            }
        }
    },
    //watch：用于观察Vue实例上的数据变动。对应一个对象,键是观察表达式,值是对应回调。
    watch: {}
});

/**
 * @content getJSONData
 * @param data
 * @returns result 后台获取的数据
 */
function getJSONData(data) {
    let result = null;
    $.ajax({
        url: '127.0.0.1',
        async: false, // 设置为false，保持js有效
        type: 'POST',
        data: data,
        dataType: 'json',
        success: (data) => {
            // console.log("success", data);
            result = data
        },
        error: (e) => {
            console.log("error", e)
        }
    });
    return result;
}

function f() {
    console.log("hello canvas")
}

/**
 * #date：2020/02/19
 * #log：一开始使用jQuery进行组件的动态控制，但Vue与js的兼容存在问题，为了方便操作，基本去掉jQuery的部分，采用vue进行组件的动态控制
 * 会增加一些代码可动性的复杂度，但基本逻辑部分代码比较统一
 * #date：2020/02/20
 * #log: 画布自适应屏幕变化，只能通过动态的添加画布和绘制，当屏幕尺寸变化的时候，删除旧画布并重新添加新画布和重新绘制
 */
