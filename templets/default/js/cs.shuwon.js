/*
 *	Created by Edward on 16/05/03
 *	Copyright (c) 2016 shuwon.com All rights reserved
 */

var yanyang = {
	init: function() {
		switch (jsFun) {
			case 'about':
			yanyang.aboutPage();
			break;
			
			case 'Collection':
			yanyang.CollectionPage();
			break;
			
		}
		yanyang.backTop();
		if($(".nav").length!==0){
			var oTop = $(".nav").offset().top;
			$(window).scroll(function(){
				if($(window).scrollTop()>=oTop){
					$(".nav").addClass("active");
				}else{
					$(".nav").removeClass("active");
				}
			})
		}
	},
	aboutPage: function() {
		$("#about .contactUs .contactUs_tab_btn ul li").click(function(){
			var i = $(this).index();
			$(this).addClass("cur").siblings().removeClass("cur");
			$("#about .contactUs .contactUs_tab .btn_cr").eq(i).show().siblings().hide()
		})
		$("#about .contactUs .contactUs_tab .btn_recruiting .recruiting_list .recruiting_list_over ul li").click(function(){
			var i = $(this).index();
			$(this).addClass("cur").siblings().removeClass("cur")
		})
		//川邮期刊
		var Statistics=0;
	    var $journal=$("#about .JournalOFSichuan .model_productShow .model_productShow_over ul")
	    var $journal_w=$journal.find("li").outerWidth(true)
	    var $journal_seiz=$journal.find("li").size();
	    var $productBtnR=$(".model_productShow_btnR");
	    var $productBtnL=$(".model_productShow_btnL");
	    if($journal_seiz<=4){
	    	$productBtnR.fadeOut()
	    	$productBtnL.fadeOut()
	    }
	    $productBtnR.click(function(){
	    	Statistics>=$journal_seiz-4?Statistics=$journal_seiz-4:Statistics++;
	    	if(Statistics==$journal_seiz-4){
	    		$productBtnR.fadeOut()
	    		$productBtnL.fadeIn()
	    	}else{
	    		$productBtnR.fadeIn()
	    	}
	    	$journal.stop().animate({left:-Statistics*$journal_w},{duration:1000,easing:'easeInOutExpo'});
	    	
	    })
	    $productBtnL.click(function(){
	    	Statistics<=0?Statistics=0:Statistics--;
	    	if(Statistics==0){
	    		$productBtnL.fadeOut()
	    		$productBtnR.fadeIn()
	    	}else{
	    		$productBtnL.fadeIn()
	    	}
	    	$journal.stop().animate({left:-Statistics*$journal_w},{duration:1000,easing:'easeInOutExpo'});	
	    })
	    
	    var $journal_li=$journal.find("li");
	    for(var i=0;i<$journal_seiz-1;i++){
	    	var $journal_img=$journal_li.find(".pic img").attr("src");
	    	
	    	$journal_li.eq(i).find(".shadow").append("<img src='"+$journal_img+"'>")
	    }
	    //
	    
	},
	CollectionPage:function(){
		var explorer =navigator.userAgent ;
		    //ie 
		    if (explorer.indexOf('MSIE') >= 0) {
		    	var Statistics=0;
		    	var items_size=$(".items--small li").size();
		    	
		    	$(".items--small li").click(function(){
		    		Statistics = $(this).index();
		    		collection(Statistics);
		    	})
		    	$(".ie_items_big .btn_openr span.icon-grids").click(function(){
		    		$(".ie_items_big").hide();
		    		$(".ie_items_big .ie_items_big_over ul li").remove()
		    	})
		    	
		    	$(".icon-arrow-lefts").click(function(){
		    		Statistics<=0?Statistics==0:Statistics--;
		    		collection(Statistics);
		    	})
		    	$(".icon-arrow-rights").click(function(){
		    		Statistics>=items_size-1?Statistics=items_size-1:Statistics++
		    		collection(Statistics);
		    	})
		    	
		     	function collection(Statistics){
		     		$(".ie_items_big .ie_items_big_over ul li").remove()
		    		var imgSrc=$(".items--small li").eq(Statistics).find("img").attr("src")
					var dataname=$(".items--small li").eq(Statistics).data("names")
					var datasummary=$(".items--small li").eq(Statistics).data("summary")
					$(".ie_items_big").fadeIn()
		    		$(".ie_items_big .ie_items_big_over ul").append("<li><div class='pic'><img src='"+imgSrc+"'/></div><div class='summary'><div class='title'>"+dataname+"</div><article>"+datasummary+"</article></div></li>")
		    	}
		    }
		    
	},
	
	/**
	 * 返回到顶部方法
	 *
	 */
	backTop: function() {
		scroll_top_duration = 500,
		$back_to_top = $('.backTop');
	
		$back_to_top.click(function(event) {
			event.preventDefault();
			$('body,html').animate({
				scrollTop: 0,
			}, scroll_top_duration);
		});
	},
}
$(window).load(function(){
	jsFun = $("#JS").attr('page');
	yanyang.init();
	$(".rightNav .wxBtn").hover(function(){
		$(".rightNav .imgBox").stop(false,true).fadeIn();
	},function(){
		$(".rightNav .imgBox").stop(false,true).fadeOut();
	});
	
	
	$(".rightNav .qqBtn").hover(function(){
		$(this).children(".qqBox").stop(false,true).fadeIn();
	},function(){
		$(this).children(".qqBox").stop(false,true).fadeOut();
	})
})