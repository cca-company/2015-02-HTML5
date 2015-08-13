//online, offline event 할당
// 오프라인일 때 헤더 엘리먼트에 오프라인 클래스 추가하고
// 온라인일 때 헤더 엘리먼트에 오프라인 클래스 삭제

//ajax
var TODOSync = {

	init: function(){
		window.addEventListener("online", this.onofflineListener);
		window.addEventListener("offline", this.onofflineListener);
	},
	onofflineListener: function(){
		document.getElementById("header").classList[navigator.onLine?"remove":"add"]("offline");
		if(navigator.onLine){
			//server로 snyc 맞추기
		}
	},
	get: function(callback){
		// url
		// id
		var xhr = new XMLHttpRequest();
		xhr.open("GET","http://128.199.76.9:8002/yskoh",true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");

		xhr.addEventListener('load', function(e){
			if(this.status == 200){
				callback(JSON.parse(xhr.responseText));
			}
		});
		xhr.send();

	},
	add : function(todo, callback){

		if(navigator.onLine){
			var xhr = new XMLHttpRequest();
			xhr.open("PUT","http://128.199.76.9:8002/yskoh",true);
			//body에 값을 보내는데, utf-8로 인코딩해서 보내겠다~
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");

			xhr.addEventListener('load', function(e){
				if(this.status == 200){
					callback(JSON.parse(xhr.responseText));
				}
			});
			console.log("@@@@@");
			console.log("todo=" + todo);
			xhr.send("todo=" + todo);
			// var param = { method: "PUT", url: "http://128.199.76.9:8002/yskoh", data: "todo=" + todo };
			// $.ajax(param).then(callback);
		}
		else{
			//data 클라에 저장- localStorage, indexDB, websql

		}
	},
	completed: function(param, callback){
		var xhr = new XMLHttpRequest();
		xhr.open("POST","http://128.199.76.9:8002/yskoh/"+param.key,true);
		//body에 값을 보내는데, utf-8로 인코딩해서 보내겠다~
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");

		xhr.addEventListener('load', function(e){
			if(this.status == 200){
				callback(JSON.parse(xhr.responseText));
			}
		});
		xhr.send("completed="+param.completed);
	},
	remove: function(param, callback){
		var xhr = new XMLHttpRequest();
		xhr.open("DELETE", "http://128.199.76.9:8002/yskoh/"+param,true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");

		xhr.addEventListener('load', function(e){
			if(this.status == 200){
				callback(JSON.parse(xhr.responseText));
			}
		});
		xhr.send("remove="+param);
	}
}

var TODO = {
	ENTER_KEYCODE: 13,
	init : function(){
		
		document.addEventListener('DOMContentLoaded', function(){
			this.get();
			document.getElementById('new-todo').addEventListener('keydown', this.add.bind(this));
			
		}.bind(this));
	},

	initEventBind: function(){
		document.getElementById("todo-list").addEventListener("click", this.eventFilter.bind(this));
		document.getElementById("filters").addEventListener("click", this.changeStateFilter);
	},
	changeStateFilter: function(e){
		var target = e.target;
		var tagName = target.tagName.toLowerCase();
		if(tagName =="a"){
			var href = target.getAttribute("href");
			console.log(href);
		}
		e.preventDefault();
	},
	eventFilter: function(e){
		var ele = e.target;
		var tagName = ele.tagName.toLowerCase();
		if(tagName == "input"){
			this.completed(ele);
		}else if(tagName == "button"){
			this.remove(ele.parentNode.parentNode);
		}
	},
	build : function (context){
		var source = $('#entry-template').html();
		var template = Handlebars.compile(source);
		var li = template(context);
		
		// li.style.opacity = 0;
		// // document.getElementById('todo-list').appendChild(todoLi);
		// var i = 0;
		// var key = setInterval(function(){
		// 	//setInterval(function key(){})해도 됨??
		// 	if(i === 50){
		// 		//???????
		// 		clearInterval(key);
		// 	}else{
		// 		li.style.opacity = i * 0.02;
		// 	}
		// 	i++;
		// },16);

		return li;
	},
	get: function(callback){
		TODOSync.get(function(json){
			var oUl = document.getElementById("todo-list");
			for(var i=json.length - 1; i >= 0 ; i--){
				var checkComplete;
				var context = { target: json[i].todo, idNumber: json[i].id };
				context.checkCompleted = json[i].completed ? "completed" : "";
				oUl.insertAdjacentHTML('afterbegin', this.build(context));
			}

			var deletes = document.getElementsByClassName('destroy');
			for( var i=0 ; i < deletes.length; i++){
				deletes[i].addEventListener('click', this.remove.bind(this));
			}

			var completes = document.getElementsByClassName('toggle');
			for( var i=0; i< completes.length; i++){
				completes[i].addEventListener('click', this.completed.bind(this));
			}
			
		}.bind(this));
	},
	completed: function(e){
		
		var input = e.currentTarget;
		var li = input.parentNode.parentNode;
		var completed = input.checked?"1":"0";
		var keyId = li.getElementsByClassName('id')[0];

		TODOSync.completed({ "key": keyId.value, 
			"completed": completed
		}, function(){
			if(completed==="1"){
				li.className = "completed";
			}
			else{
				li.className = "";
			}

		});
	},
	remove: function (e){
		var button = e.currentTarget;
		var removeLi = button.parentNode.parentNode;
		console.log(removeLi);
		var toRemove = removeLi.getElementsByClassName('id')[0];
		////
		TODOSync.remove(toRemove.value, function(){
			var i = 0;
			var key = setInterval(function(){
				if(i === 50){
					removeLi.parentNode.removeChild(removeLi);			
					clearInterval(key);
				}else{	
					removeLi.querySelector("label").style.opacity = 1 - (i * 0.02);
				}
				i++;
			},16);
		});
	},
	add: function(e){
		if(e.keyCode === this.ENTER_KEYCODE){
			var todo = document.getElementById('new-todo');
			TODOSync.add(todo.value, function(json){
				var oUl = document.getElementById("todo-list");
				var context = { target: todo.value};
				oUl.insertAdjacentHTML('afterbegin', this.build(context));
				todo.value = "";
			}.bind(this));
		}
	}

};

TODOSync.init();
TODO.init();