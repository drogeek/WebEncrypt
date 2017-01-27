$(function(){
		//we check if it's the first time the application was launched
		//I'm not using cordova right now

		password="", encSites=[], decSites=[];
		db=localStorage;

		// we set options for loader
		$(document).on("mobileinit", function(){
			$.mobile.loader.prototype.options.theme = "a"
		});

		if (db.firstLog != 1){
			popup("create",false);
		}

		else{
			popup("login",false);
		}

		$("#addSite").click(function(){
			popup("addSite",true);
		});

		$("#changePwd").click(function(){
			popup("changePwd",true);
		});
		
		$("#deleteAll").click(function(){
			
			popup("deleteAll",true);
		});

		$(document).on("pageshow","#listSitePage",function(){
			refreshWebsiteList();
		});
});

function refreshWebsiteList(){
	$("#listSites").empty();
	for(idx in decSites){
		addLineTableWebsite(decSites[idx],"#listSites");
	}
}

function addLineTableWebsite(obj,target){
	var $line=$("<li style='text-align: center; margin: 5px'>"+obj.site+"</li>").appendTo(target);
	$line.click(function(){
			//bad practice inline style
		var $popUp = $("<div style='padding: 30px 50px 30px 50px;'/>").popup({
			transition : "pop",
			theme : "a",
			afterclose: function(){
				this.remove();
			}
		});
		$("<h4>Site</h4>").appendTo($popUp);
		$("<p id='editSite'>"+obj.site+"</p>").appendTo($popUp);
		$("<h4>Login</h4>").appendTo($popUp);
		$("<p id='editLogin'>"+obj.login+"</p>").appendTo($popUp);
		$("<h4>Password</h4>").appendTo($popUp);
		$("<p id='editPass'>"+obj.pass+"</p>").appendTo($popUp);
		var $editButton = $("<button>Edit</button>").appendTo($popUp);
		var $deleteButton = $("<button>Delete</button>").appendTo($popUp);
		$editButton.click(function(){
			$('#editSite').replaceWith("<input id='editedSite' type='text' value='"+obj.site+"'/>");
			$('#editLogin').replaceWith("<input id='editedLogin' type='text' value='"+obj.login+"'/>");
			$('#editPass').replaceWith("<input id='editedPass' type='text' value='"+obj.pass+"'/>");
			$buttonAccEdit = $("<button id='acceptEdit'>Valider</button>");
			$editButton.replaceWith($buttonAccEdit);
			$('#acceptEdit').click(function(){
				obj.site=$('#editedSite').val();
				obj.login=$('#editedLogin').val();
				obj.pass=$('#editedPass').val();
				$popUp.popup("close");

				//reencrypt everything and store it in the DB	
				$.mobile.loading("show");
				reencrypt($popUp);
				refreshWebsiteList();
			});
		});
		$deleteButton.click(function(){
			var del=decSites.indexOf(obj);
			if(del != -1){
				decSites.splice(del,1);
			}
			refreshWebsiteList();
			$popUp.popup("close");
		});
		$popUp.popup("open").trigger("create");
	});
}

function reencrypt(popUp){
	var worker = new Worker('js/worker.js');
	worker.postMessage(["encrypt",password,decSites]);
	worker.onmessage = function(res){
		encSites=res.data;
		db.encSites = JSON.stringify(encSites);
		$.mobile.loading("hide");
		popUp.popup("close");
	}
}

function popup(type,dismissible){
	var $popUp = $("<div/>").popup({
		'dismissible' : dismissible,
		transition : "pop",
		theme : "a",
		afterclose: function(){
			this.remove();
		}
	});

	if(type == 'create'){
		
		$("<h3>Creer mdp</h3>").appendTo($popUp);
		$("<label for='mdp-box1'>Entrer mdp</label>").appendTo($popUp);
		$("<input id='mdp-box1' name='mdp-box1' type='password'/>").appendTo($popUp);
		$("<label for='mdp-box2'>Entrer mdp de nouveau</label>").appendTo($popUp);
		$("<input id='mdp-box2' name='mdp-box2' type='password'/>").appendTo($popUp);
		$("<button id='validateCreatePwd' type='submit' class='ui-btn ui-corner-all ui-shadow ui-btn-icon-left ui-icon-check'>Valider</button>").appendTo($popUp);
		$("#validateCreatePwd").click(function(){
				// we check that the two passwords are identical and not empty
				if( $("#mdp-box1").val() != '' && $("#mdp-box2").val() != '' && $("#mdp-box1").val() == $("#mdp-box2").val() ){
					password = $("#mdp-box1").val();
					db.firstLog = 1;
					encSites = [];
					db.encSites = JSON.stringify(encSites);
					// we store the hash of the password
					db.hash = sjcl.hash.sha256.hash(password);
					// we create a random salt
					// problem… Math.random isn't secure, and sjcl random function is supposed to wait 10 sec
					// of user's interaction, we can't afford this
					// window.crypto object seems nice, 
					// but is supported only on 4.4 Android devices and above
					// useless for now
					var salt = new Uint32Array(10);
					window.crypto.getRandomValues(salt)
					db.salt = sjcl.codec.base64.fromBits(salt);
					$popUp.popup("close");
				}

		});
	}

	else if(type == "login"){
		$("<h3>Mot de passe</h3>").appendTo($popUp);
		$("<label for='mdp-box1'>Entrer mdp</label>").appendTo($popUp);
		$("<input id='mdp-box1' name='mdp-box1' type='password'/>").appendTo($popUp);
		$("<div id='validateLoginErr'/>").appendTo($popUp);
		$("<button id='validateLoginPwd' type='submit' class='ui-btn ui-corner-all ui-shadow ui-btn-icon-left ui-icon-check'>Valider</button>").appendTo($popUp);
		$("#validateLoginPwd").click(function(){
				if (sjcl.hash.sha256.hash($("#mdp-box1").val()) == db.hash){
					password = $("#mdp-box1").val();
					$.mobile.loading("show");

					//launch decrypt async
					var worker = new Worker('js/worker.js');
					worker.postMessage(["decrypt",password,db.encSites]);
					worker.onmessage = function(res){
						encSites=res.data[0];
						decSites=res.data[1];
						$.mobile.loading("hide");
						$popUp.popup("close");
					}

				}
				else{
					// we print error if it wasn't already printed
					if($("#validateLoginErr").val() == ''){
						$("#validateLoginErr").text("Mot de passe incorrect");
					}
				}
		});
	}
	
	else if(type == "changePwd"){
		$("<h3>Changer mdp</h3>").appendTo($popUp);
		$("<label for='currentPwd'>Entrer ancien mdp</label>").appendTo($popUp);
		$("<input id='currentPwd' name='currentPwd' type='password'/>").appendTo($popUp);
		$("<label for='changeMdp-box1'>Entrer nouveau mdp</label>").appendTo($popUp);
		$("<input id='changeMdp-box1' name='changeMdp-box1' type='password'/>").appendTo($popUp);
		$("<label for='changeMdp-box2'>Entrer nouveau mdp de nouveau</label>").appendTo($popUp);
		$("<input id='changeMdp-box2' name='changeMdp-box2' type='password'/>").appendTo($popUp);
		$("<button id='validateChangePwd' type='submit' class='ui-btn ui-corner-all ui-shadow ui-btn-icon-left ui-icon-check'>Valider</button>").appendTo($popUp);
		$("#validateChangePwd").click(function(){
			if( sjcl.hash.sha256.hash($("#currentPwd").val()) == db.hash ){
				if( $("#changeMdp-box1").val() != '' && $("#changeMdp-box2").val() != '' && $("#changeMdp-box1").val() == $("#changeMdp-box2").val() ){
					password = $("#changeMdp-box1").val();
					db.hash = sjcl.hash.sha256.hash(password);
					var newEncSites = [];
					
					// we show loader
					$.mobile.loading("show"); 
					
					reencrypt($popUp);
					
					//we hide loader
				}
			}

		});
	}

	else if(type == "addSite"){
		$("<h3>Ajouter un site</h3>").appendTo($popUp);
		$("<label for='currentPwd'>Nom du site</label>").appendTo($popUp);
		$("<input id='siteName' name='siteName' type='text'/>").appendTo($popUp);
		$("<label for='siteLogin'>Login</label>").appendTo($popUp);
		$("<input id='siteLogin' name='siteLogin' type='text'/>").appendTo($popUp);
		$("<label for='sitePwd'>Mot de passe</label>").appendTo($popUp);
		$("<input id='sitePwd' name='sitePwd' type='password'/>").appendTo($popUp);
		$("<button id='validateAddSite' type='submit' class='ui-btn ui-corner-all ui-shadow ui-btn-icon-left ui-icon-check'>Valider</button>").appendTo($popUp);
		$("#validateAddSite").click(function(){
			var objToStore = { 
				site: $("#siteName").val(),
				login: $("#siteLogin").val(),
				pass: $("#sitePwd").val()
			}

			decSites.push(objToStore);
			encSites.push(sjcl.json.encrypt(
				password,
				JSON.stringify(objToStore)/*,
				{
					salt: db.salt,
					cipher: "aes",
					mode: "ccm",
					ks: 128
				}
				*/
			));
			db.encSites=JSON.stringify(encSites);
			$popUp.popup("close");
		});
	}

	else if (type == "deleteAll"){
		$("<h3>ATTENTION : Voulez-vous vraiment supprimer toute la base?</h3>").appendTo($popUp);
		$("<div><button id='validateDeleteAll'>Oui</button><button id='discardDeleteAll'>Non</button>").appendTo($popUp);
		$("#validateDeleteAll").click(function(){
			encSites=[];
			decSites=[];
			db.encSites="";
			$popUp.popup("close");
		});
		$("#discardDeleteAll").click(function(){
			$popUp.popup("close");
		});
	}
	$popUp.popup("open").trigger("create");
}
