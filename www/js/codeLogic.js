$(function(){
		//we check if it's the first time the application was launched
		//I'm not using cordova right now

		password="", encSites=[];
		db=localStorage;
		//I may add a sessionStorage variable in the future to allow the user to login only once per tab
		if (db.firstLog != 2){
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

		$(document).on("pageshow","#listSite",function(){
			$("#tableContent").empty();
			for(idx in encSites){
				addLineTableWebsite(
					JSON.parse(sjcl.json.decrypt(
						password,
						encSites[idx]/*,
						{
							salt: db.salt,
							cipher: "aes",
							mode: "ccm",
							ks: 128
						}
						*/
					)),
					"#tableContent"
				);
			}
		});
});

function addLineTableWebsite(obj,target){
	var line=$("<tr/>").appendTo(target);
	$("<td>"+obj.site+"</td>").appendTo(line);
	$("<td>"+obj.login+"</td>").appendTo(line);
	$("<td>"+obj.pass+"</td>").appendTo(line);
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
					db.encSites = JSON.stringify([]);
					encSites = [];
					// we store the hash of the password
					db.hash = sjcl.hash.sha256.hash(password);
					// we create a random salt
					// problem… Math.random isn't secure, and sjcl random function is supposed to wait 10 sec
					// of user's interaction, we can't afford this
					// window.crypto object seems nice, 
					// but is supported only on 4.4 Android devices and above
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
					alert(db.encSites);
					encSites=JSON.parse(db.encSites);
					console.log(encSites);
					$popUp.popup("close");
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
					oldPwd = password;
					password = $("#changeMdp-box1").val();
					db.hash = sjcl.hash.sha256.hash(password);
					var newEncSites = [];
					for(idx in encSites){
						var oldValue = sjcl.json.decrypt(oldPwd,encSites[idx]);
						newEncSites.push(sjcl.json.encrypt(
							password,
							oldValue/*,
							{
								salt: db.salt,
								cipher: "aes",
								mode: "ccm",
								ks: 128
							}
							*/
						));
					}
					encSites = newEncSites;
					$popUp.popup("close");
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
			db.encSites=sjcl.json.encode(encSites);
			$popUp.popup("close");
		});
	}

	else if (type == "deleteAll"){
		$("<h3>ATTENTION : Voulez-vous vraiment supprimer toute la base?</h3>").appendTo($popUp);
		$("<div><button id='validateDeleteAll'>Oui</button><button id='discardDeleteAll'>Non</button>").appendTo($popUp);
		$("#validateDeleteAll").click(function(){
			encSites=[];
			db.encSites="";
			$popUp.popup("close");
		});
		$("#discardDeleteAll").click(function(){
			$popUp.popup("close");
		});
	}
	$popUp.popup("open").trigger("create");
}
