$(function(){
		//we check if it's the first time the application was launched
		//I'm not using cordova right now
		db=localStorage;
		//I may add a sessionStorage variable in the future to allow the user to login only once per tab
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
});

function popup(type,dismissible){
	var $popUp = $("<div/>").popup({
		'dismissible' : dismissible,
		transition : "pop",
		theme : "a"
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
					db.firstLog = 1;
					// we store the hash of the password
					db.hash = sjcl.hash.sha256.hash($("#mdp-box1").val());
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
					$popUp.popup("close");
				}
				else{
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
					db.hash = sjcl.hash.sha256.hash($("#changeMdp-box1").val());
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
			$popUp.popup("close");
		});
	}

	$popUp.popup("open").trigger("create");
}
