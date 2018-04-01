{
    let mySwiper = new Swiper('.swiper-container', {
        direction: 'horizontal',
        loop: true,
            pagination: {
                el: '.swiper-pagination',
            },

    // // 如果需要分页器
    //     pagination: {
    //         el: '.swiper-pagination',
    //     },

        // 如果需要前进后退按钮
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

    })

//设置iscroll  让content滚动
var iscroll=new IScroll(".content",{
        mouseWheel: true,      //设置滚轮滚动
        scrollbars: true ,    //如果有滚动条，就需要加定位
        shrinkScrollbars:"scale"
})


//点击新增

    $(".add").click(function () {
        $(".mask").show();
        $(".inputarea").transition({y: 0}, 500) //有插件才可以这样写
    })
    $(".cancel").click(function () {
        $(".inputarea").transition({y: "-62vh"}, 500, function () {
            $(".mask").hide();  //inputarea动画执行完后再隐藏mask
        }) //有插件才可以这样写
    })


    $(".submit").click(function () {
        var val = $("#text").val();   //获取元素表单值
        if (val === "") {
            return;
        }
        $("#text").val();
        var data = getData();    //获取最新数据
        var time = new Date().getTime();  //保存时间
        data.push({content: val, time, star: false,done:false});
        saveData(data);
        render();
        $("#text").val("");  //将值设置为空
        $(".mask").hide();
    })

//本地存储

    function getData() {
        return localStorage.todo ? JSON.parse(localStorage.todo) : [];
    }
    function saveData(data) {
        localStorage.todo = JSON.stringify(data);
    }
    function render() {
        var data = getData();
        var str = "";
        data.forEach(function (val, index) {
            str += "<li><p>" + val.content + "</p><time>" + parseTime(val.time) + "</time><span>★</span><div class='changestate'>完成</div></li>"
        })
        $(".itemlist").html(str);
        iscroll.refresh();
        addTouchEvent();
    }
    render();
    function parseTime(time) {
        var date = new Date();
        date.setTime(time);
        var year = date.getFullYear();
        var month = setZero(date.getMonth() + 1);
        var day = setZero(date.getDay());
        var hour = setZero(date.getHours());
        var min = setZero(date.getMinutes());
        var second = setZero(date.getSeconds());
        return year + "/" + month + "/" + day + "<br>" + hour + ":" + min + ":" + second;
    }
    function setZero(n) {
        return n < 10 ? "0" + n : n;
    }

//实现左右滑动

    function addTouchEvent(){
        $(".itemlist>li").each(function(index,ele){
            let hammerobj = new Hammer(ele);   //实例化hammer
            let sx,cx,movex;
            let max=window.innerWidth/5;   //将20vw转化为像素
            let state="start";
            let flag=true;  //决定手指离开之后是否有动画

            hammerobj.on("panstart",function(e){       //使用hammer
                // ele.ontouchstart=function(e){    //原生语法
                sx=e.center.x;
                ele.style.transition="";  //去掉过渡属性
                // sy=e.changedTouches[0].clientY;  只需左右滑动，所以无需获取y的值
            })

            hammerobj.on("panmove",function(e){       //使用hammer
                //ele.ontouchmove=function(e){
                let cx=e.center.x;
                // cy=e.changedTouches[0].clientY;
                movex=cx-sx;
                if(movex>0&&state==="start"){   //开始不能往右走
                    flag=false;
                    return;  //设置右滑无效
                }
                if(Math.abs(movex)>max){
                    flag=false;
                    state=state==="start"?"end":"start";
                    if(state==="end"){
                        $(ele).css("x",max)
                    }else{
                        $(ele).css("x",0)

                    }
                    return;   //左滑不会超出
                }
                if(state==="end"){
                    movex=-max+cx-sx; //上次唯一基础上再加上这次位移
                }
                flag=true;
                $(ele).css("x",movex)

                if(state==="end"&&movex<0){  //结束不在往左拖:
                    flag=false;
                    return
                }
                //$(ele).style.transform=`translate(${movex}px)`;  //拖动的值  原生语法
                $(ele).css("x",movex)
            })

            hammerobj.on("panend",function(e){       //使用hammer
                //ele.ontouchend=function(){
                if(!flag){return}
                // ele.style.transition="all 0.5s";  //设置过度属性原生语法
                if(Math.abs(movex)>max/2){
                    $(ele).transition({x:-max});
                    //ele.style.transform=`translateX(-${max}px)`; 原生语法
                    state="end";
                }else{
                    $(ele).transition({x:0});
                    //ele.style.transform="translateX(0px)";    原生语法
                    state="start";
                }

            })
        })
    }
}