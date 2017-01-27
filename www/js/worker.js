importScripts("http://bitwiseshiftleft.github.io/sjcl/sjcl.js");
function worker(){
	onmessage = function(arg){
		var type = arg.data[0], password=arg.data[1];
		if(type == "decrypt"){
			var jsonStr=arg.data[2], encSites=JSON.parse(jsonStr), decSites=[];
			for(idx in encSites){
				decSites.push(JSON.parse(sjcl.json.decrypt(
					password,
					encSites[idx]/*,
					{
						salt: db.salt,
						cipher: "aes",
						mode: "ccm",
						ks: 128
					}
					*/
					)
				));
			}
			postMessage([encSites,decSites]);
		}

		else if (type == "encrypt"){
			var decSites = arg.data[2],newEncSites = [];
			for(idx in decSites){
				newEncSites.push(sjcl.json.encrypt(
					password,
					JSON.stringify(decSites[idx])/*,
					{
						salt: db.salt,
						cipher: "aes",
						mode: "ccm",
						ks: 128
					}
					*/
				));
			}
			postMessage(newEncSites);
		}
	};
}
worker();
