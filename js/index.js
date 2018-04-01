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
        shrinkScrollbars:"scale",
        click:true
})


//点击新增
    var state="project";  //状态保存当前是显示的什么状态的内容
    $(".add").click(function () {
        $(".mask").show();
        $(".inputarea").transition({y: 0}, 500) //有插件才可以这样写
        $(".submit").show();
        $(".update").hide();
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
        $("#text").val("");
        var data = getData();    //获取最新数据
        var time = new Date().getTime();  //保存时间
        data.push({content: val, time, star: false,done:false});
        saveData(data);
        render();
        $("#text").val("");  //将值设置为空
        $(".mask").hide();
    })



    //给未完成、未完成已完成添加点击，当点击已完成会出现已完成内容，但是当前没有添加到已完成中，所以现在点击还是空白
    $(".project").click(function(){
        state="project";
        $(this).addClass("active").siblings().removeClass("active");
        render();
    })
    $(".done").click(function(){   //点击done,state就变为done
        state="done"; //随便写什么都可以
        $(this).addClass("active").siblings().removeClass("active");  //给当前添加active类名，给兄弟元素去掉该类名
        render();
    })
    $(".update").click(function(){
        var val = $("#text").val();   //获取元素表单值
        if (val === "") {
            return;
        }
        $("#text").val("");
        var data = getData();    //获取最新数据
        var index=$(this).data("index");
        data[index].content=val;
        saveData(data);
        render();
        $("#text").val("");  //将值设置为空
        $(".mask").hide();
    })

    //通过事件委派，给ul添加点击事件，委派还给完成，点击后已完成中有内容
    $(".itemlist")
    //点击完成，已完成中添加上内容
        .on("click",".changestate",function(){
        var index= $(this).parent().attr("id");
        var data=getData();
        data[index].done=true;
        saveData(data);
        render();
        })
    //实现删除
        .on("click",".del",function(){
            var index= $(this).parent().attr("id");
            var data=getData();
            data.splice(index,1);
            saveData(data);
            render();
        })
        //点击星星 ，星星变色
        .on("click","span",function(){
            var index= $(this).parent().attr("id");
            var data=getData();
            data[index].star=!data[index].star;
            saveData(data);
            render();
        })
        //点击内容 ，进行修改，提交隐藏，修改显示
        .on("click","p",function(){
            var index= $(this).parent().attr("id");
            var data=getData();
            $(".mask").show();
            $(".inputarea").transition({y: 0}, 500);
            $("#text").val(data[index].content);
            $(".submit").hide();
            $(".update").show();
            $(".update").data("index",index);  //给update设置index属性

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
            if(state==="project"&&val.done===false) {  //在未完成中加的内容
                str += "<li id="+index+"><p>" + val.content + "</p><time>" + parseTime(val.time) + "</time><span class="+(val.star?"active":"")+">★</span><div class='changestate'>完成</div></li>"
            }else if(state==="done"&&val.done===true){
                str += "<li id="+index+"><p>" + val.content + "</p><time>" + parseTime(val.time) + "</time><span class="+(val.star?"active":"")+">★</span><div class='del'>删除</div></li>"
                //将li的id设置为index，为了知道删除哪条值
            }
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
    //渲染完成调用
    function addTouchEvent(){
        $(".itemlist>li").each(function(index,ele){
            let hammerobj = new Hammer(ele);   //实例化hammer
            let sx,cx,movex;
            let max=window.innerWidth/5;   //将20vw转化为像素
            let state="start";
            let flag=true;  //决定手指离开之后是否有动画

            hammerobj.on("panstart",function(e){
                ele.style.transition="";
                sx=e.center.x;
            })

            hammerobj.on("panmove",function(e){
                let cx=e.center.x;
                movex=cx-sx;

                if(movex>0&&state==="start"){   //开始不能往右走
                    flag=false;
                    return;  //设置右滑无效
                }

                if(state==="end"&&movex<0){  //结束不在往左拖:
                    flag=false;
                    return
                }

                if(Math.abs(movex)>max){
                    flag=false;
                    state=state==="start"?"end":"start";
                    if(state==="end"){
                        $(ele).css("x",-max)
                    }else{
                        $(ele).css("x",0)

                    }
                    return;   //左滑不会超出
                }

                if(state==="end"){
                    movex=-max+cx-sx; //上次唯一基础上再加上这次位移
                }
                flag=true;
                $(ele).css("x",movex);

            })

            hammerobj.on("panend",function( ){       //使用hammer
                if(!flag){return}
                if(Math.abs(movex)>max/2){
                    $(ele).transition({x:-max});
                    state="end";
                }else{
                    $(ele).transition({x:0});
                    state="start";
                }

            })
        })
    }
}