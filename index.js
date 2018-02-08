var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var url = "http://streema.com/radios/country/Thailand"; 
//初始url 

var l1arr = [];
var l2arr = []

function fetchPage(x) {     //封装了一层函数
	var m3uhead = "#EXTM3U\r\n\r\n";
	fs.appendFile('./data/play.m3u', m3uhead, 'utf-8', function (err) {
		if (err) {
			console.log(err);
		}
	});
	startRequest(x,'1'); 
}


function startRequest(x,y) {
	console.log('x'+x+'y'+y);
	//采用http模块向服务器发起一次get请求      
	http.get(x, function (res) {     
		var html = '';        //用来存储请求网页的整个html内容
		res.setEncoding('utf-8'); //防止中文乱码
		//监听data事件，每次取一块数据
		res.on('data', function (chunk) {   
			html += chunk;
		});
		//监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
		res.on('end', function () {

			var $ = cheerio.load(html); //采用cheerio模块解析html

			switch(y)
			{
				case '1':
					var obj1 = $('.geo-list ul li a');
					obj1.each(function(idx,obj1i){
						//console.log(obj1i.attribs.href);
						l1arr.push('http://streema.com'+obj1i.attribs.href);
					});
					if(l1arr.length >0){
						var xx = l1arr.pop().toString();
						console.log(xx);
						console.log('-------');
						startRequest(xx,'2');
					}
					//console.log(l1arr);
					break;
				case '2':
					var obj2 = $('div[data-role="player-popup"]');
					obj2.each(function(idx,obj2i){
						//console.log(obj2i.attribs['data-url']);
						//console.log('http://streema.com'+obj2i.attribs['data-url']);
						l2arr.push('http://streema.com'+obj2i.attribs['data-url']);
					});
					console.log('jjjjjjj');
					console.log(l2arr);
					if(l2arr.length > 0){
						var xx2 = l2arr.pop().toString();
						startRequest(xx2,'3');
					}else{
						if(l1arr.length >0){
							var xx = l1arr.pop().toString();
							console.log(xx);
							console.log('2-2------');
							startRequest(xx,'2');
						}
					}
					break;
				case '3':
					var obj3 = $('.stream-downloads a');
					console.log('xxxxxxxxx3333');
					//console.log(obj3);
					savetom3u(obj3[0]);
					if(l2arr.length > 0){
						var xx2 = l2arr.pop().toString();
						startRequest(xx2,'3');
					}else{
						if(l1arr.length >0){
							var xx = l1arr.pop().toString();
							console.log(xx);
							console.log('2-2------');
							startRequest(xx,'2');
						}
					}

					break;
			}

		});

	}).on('error', function (err) {
		console.log(err);
	});

}

function savetom3u(obj){
	x="#EXTINF:-1, "+obj.attribs.download+"\r\n"+obj.attribs.href+"\r\n\r\n";
	fs.appendFile('./data/play.m3u', x, 'utf-8', function (err) {
		if (err) {
			console.log(err);
		}
	});
}

fetchPage(url);      //主程序开始运行
