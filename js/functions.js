var provider = new firebase.auth.GoogleAuthProvider();

function matchesCont(){
    matchesEnDB.on("value",function(snapshot){
        var matches="";
        var datos = snapshot.val();
        var t1;
        var t2;
        for(var key in datos){
            teamsEnDB.orderByChild('teamKey').equalTo(datos[key].team1).on("value", function(snapshot2){
                snapshot2.forEach(function(data){
                    t1 = data.val();
                })
            })
            teamsEnDB.orderByChild('teamKey').equalTo(datos[key].team2).on("value", function(snapshot2){
                snapshot2.forEach(function(data){
                    t2 = data.val();
                })
            })
            matches += '<li class="clickable-item"><a onClick="cargarMatchInfo(\'' + datos[key].matchKey + '\',\'' + t1.teamKey + '\',\'' + t2.teamKey + '\');alternar(\'matchinfo_box\',\'matches_box\')" class="text-decoration-none"><div class="pl-4"><div class="bloq pr-5 pt-2 pb-2">' + t1.teamName + ' <span class="text-danger">vs</span> ' + t2.teamName + '</div></div></a></li>'
        }
        document.getElementById("matchesCont").innerHTML = matches;
    })
}








function registerWithEmail(){
    firebase.auth().createUserWithEmailAndPassword($('#uname').val(), $('#upass').val())
        .then(function(result) {
            $('#reg_suc').show();
            $("#login_box").css('pointer-events', 'none');
            setTimeout(function(){ 
                showLogin();
                saveData(result.user)
                alternar('main_box','login_box');
                alternar('main_box','reg_suc')
            }, 3000);
        })
        .catch(function(error) {
            var errorMessage;
            var code = error.code;
            switch (code) {
                case 'auth/invalid-email':
                    errorMessage = 'Formato de email invalido'
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Contraseña debil'
                    break;
                case 'auth/email-already-in-use':
                    errorMessage = 'Email en uso'
            }
            console.log(code)
            document.getElementById('reg_error_code').innerHTML = errorMessage;
            $('#reg_error').show();
            setTimeout(function(){
                $('#reg_error').hide();
            }, 3000)
        });
}

function loginWithEmail(){
    firebase.auth().signInWithEmailAndPassword($('#uname').val(), $('#upass').val())
        .then(function(result){
            $('#log_suc').show();
            $("#login_box").css('pointer-events', 'none');
            setTimeout(function(){ 
                showLogin();
                alternar('main_box','login_box');
                alternar('main_box','log_suc')
            }, 3000);
        })
        .catch(function(error) {
            var code = error.code
            var errorMessage;
            switch (code) {
                case 'auth/invalid-email':
                    errorMessage = 'Email invalido'
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'El email no esta registrado'
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Contraseña incorrecta'
                case 'auth/too-many-requests':
                    errorMessage = 'Estas realizando muchos intentos'
            }
            document.getElementById('log_error_code').innerHTML = errorMessage;
            $('#log_error').show();
            setTimeout(function(){
                $('#log_error').hide();
            }, 3000)
        });
}
function loginWithGoogle(){
    firebase.auth()
        .signInWithPopup(provider)
        .then(function(result) {
            $('#log_suc').show();
            $("#login_box").css('pointer-events', 'none');
            setTimeout(function(){ 
                saveData(result.user);
                showLogin();
                alternar('main_box','login_box');
                alternar('main_box','log_suc')
            }, 3000);
        });

};
function logout(){
    firebase.auth()
        .signOut().then(function() {
            $('#toLogIn').show();
            $('#toLogOut').hide();
            $("#login_box").css('pointer-events', 'unset');
            $('#logout_suc').show();
            setTimeout(function(){ 
                $('#logout_suc').hide();
            }, 3000);
        })
};
function saveData(user){
    var usuario = {
        uid:user.uid,
        nombre:user.displayName,
        email:user.email,
        foto:user.photoURL
    }
    firebase.database().ref("users/" + user.uid)
    .set(usuario)
}

var userID;
var userPic;
var dn;
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        $('#toLogIn').hide();
        $('#toLogOut').show();
        $('#msgCreator').show()
        if (user.photoURL == null & user.displayName == null){
            var dnn;
            if ($('#unick').val() == ""){
                dnn = "NoNick"
            }
            else{
                dnn = $('#unick').val()
            }
            user.updateProfile({
                photoURL: "./img/profile.png",
                displayName: dnn
            })
            $('#unick').val('')
        }
        setTimeout(function(){
            userID=user.uid;
            userPic=user.photoURL;
            dn=user.displayName;
        },500);
        if (user.email == "admin@admin.com"){
            $('#onlyAdmin').show()
        }
        $('#dang').hide();
        $('#uname').val('')
        $('#upass').val('')
        $('#unick').val('')
    } else {
        $('#onlyAdmin').hide()
        $('#dang').show();
        $('#toLogOut').hide();
        $('#toLogIn').show();
        $('#msgCreator').hide()
    }
});


var teamsEnDB = firebase.database().ref().child("teams");



matchesEnDB = firebase.database().ref().child("matches");

function teamCont(){
    teamsEnDB.on("value",function(snapshot){
        var teams="";
        var datos = snapshot.val();
        for(var key in datos){
            teams += '<li class="list-group-item"><img src="' + datos[key].teamLogo + '" class="img-gluid w-25" alt=""><div class="d-inline-block teamblock1"><h6>Team Name: <span class="font-weight-normal">' + datos[key].teamName + '</span></h6></div></li>'            
        }
        document.getElementById("teamCont").innerHTML = teams;
    })
}
teamCont();


matchesCont();

usersEnDB = firebase.database().ref().child("users");

function cargarMatchInfo(matchKey,team1Key,team2Key){
    var t1;
    var t2;
    var matchData;
    
    
    matchesEnDB.orderByChild('matchKey').equalTo(matchKey).on("value",function(snapshot){
        snapshot.forEach(function(data){
            matchData = data.val()
        })
    })
    teamsEnDB.orderByChild('teamKey').equalTo(team1Key).on("value", function(snapshot){
        snapshot.forEach(function(data){
            t1 = data.val();
        })
    })
    teamsEnDB.orderByChild('teamKey').equalTo(team2Key).on("value", function(snapshot){
        snapshot.forEach(function(data){
            t2 = data.val();
        })
    })
    matchesEnDB.child(matchKey).child('msgs').on("value",function(snapshot){
        var lista=""
        snapshot.forEach(function(data){
            lista += '<tr><td class="w-25 h-75"><img class="img-mes pt-1" src="' + data.val().usp + '"><p class="mb-0">' + data.val().un + '</p></td><td class="w-75 text-left align-top p-2">' + data.val().msg + '</td></tr>'
        })
        document.getElementById("writelist").innerHTML = lista
    })
    

    var matchInfo= '<div class="boxx d-inline-block"><h6>' + t1.teamName + '</h6><img src="' + t1.teamLogo + '" class="img-fluid w-75" alt=""></div><div class="d-inline-block"><h6>VS</h6></div><div class="boxx d-inline-block"><h6>' + t2.teamName + '</h6><img src="' + t2.teamLogo + '" class="img-fluid w-75" alt=""></div><div class="mt-3"><h6>Date: <span class="font-weight-normal">' + matchData.date + ' ' + matchData.time + ' AM</span></h6><h6>Location: <span class="font-weight-normal">' + matchData.lname + '</span></h6><div class="embed-responsive embed-responsive-16by9 ifbox">' + matchData.lframe + '</div></div>'
    document.getElementById("matchInfoCont").innerHTML = matchInfo;

    var newmsg= '<div class="cmc"><textarea id="newmsj" class="form-control ttt" placeholder="Write a comment..." rows="4"></textarea></div><button onclick="createMsg(\'' + matchKey + '\')">Submit</button>'
    document.getElementById("msgCreator").innerHTML = newmsg
}


function createMsg(matchKey){
    var msj={
        msg:$('#newmsj').val(),
        us:userID,
        usp:userPic,
        un:dn
    }
    firebase.database().ref('matches/' + matchKey + '/msgs').push(msj)
    $('#newmsj').val('')
}
function alternar(section,main){ 
    $('#' + section).effect('slide', { direction: 'right', mode: 'show' }, 500)
    $('#' + main).effect('slide', { direction: 'left', mode: 'hide' }, 500)
}
function alternarback(section,main){
    $('#' + section).effect('slide', { direction: 'left', mode: 'show' }, 500)
    $('#' + main).effect('slide', { direction: 'right', mode: 'hide' }, 500)
}
function alternarlogin(section,main){
    $('#' + section).effect('slide', { direction: 'right', mode: 'show' }, 500)
    $('#' + main).effect('slide', { direction: 'left', mode: 'hide' }, 500)
}
function login(){
    $('#about_box').effect('slide', { direction: 'up', mode: 'hide' }, 500)
    $('#contact_box').effect('slide', { direction: 'up', mode: 'hide' }, 500)
    $('#teams_box').effect('slide', { direction: 'up', mode: 'hide' }, 500)
    $('#matchinfo_box').effect('slide', { direction: 'up', mode: 'hide' }, 500)
    $('#main_box').effect('slide', { direction: 'up', mode: 'hide' }, 500)
    $('#matches_box').effect('slide', { direction: 'up', mode: 'hide' }, 500)
    $('#login_box').effect('slide', { direction: 'down', mode: 'show' }, 500)
}
function hideLogin(){
    $('#footlog').hide()
}
function showLogin(){
    $('#footlog').show()
}


function mostrarTeams(){
    teamsEnDB.on("value", function(snapshot){
        var datos = snapshot.val();
        var result = "";
        for(var key in datos){
            result += '<div class="cajon"><p>' + datos[key].teamName + '</p><img width="75px" height="75px" src="' + datos[key].teamLogo + '"/></br><img width="25px" height="25px" src="./img/delete.png" onclick="deleteDB(\'' + datos[key].teamKey + '\',\'' + datos[key].teamLogo + '\')"></div>';
        }
        document.getElementById("teamsLive").innerHTML = result;
    })
}
mostrarTeams();
function deleteDB(tKey,imgURL){
    // Create a reference to the file to delete
    var desertRef = firebase.storage().refFromURL(imgURL)
    // Delete the file
    desertRef.delete().then(function() {
    // File deleted successfully
    }).catch(function(error) {
    });
    // ----------------------
    var adaRef = firebase.database().ref('teams/' + tKey);
    adaRef.remove()
    .then(function() {
        console.log("Remove succeeded.")
    })
    .catch(function(error) {
        console.log("Remove failed: " + error.message)
    });
}

$('#createTeam').click(function(){
    var fichero = document.getElementById("teamLogo");
    var imagenASubir = fichero.files[0];
    var storageref = firebase.storage().ref().child('images/teams/' + imagenASubir.name);
    task = storageref.put(imagenASubir)
    task.on('state_changed', function(snapshot){
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              console.log('Upload is paused');
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              console.log('Upload is running');
              break;
          }
    },function(error){
        console.log(error)
    },function(){
        task.snapshot.ref.getDownloadURL().then(function(downloadURL){
            var getKey=firebase.database().ref('teams').push(team)
            var team={
                teamName:$('#teamName').val(),
                teamLogo:downloadURL,
                teamKey:getKey.key
            }
            getKey.set(team)
            $('#teamName').val('')
            $('#teamLogo').val('')
        })
    })
})


function mostrarMatch(){
    matchesEnDB.on("value",function(snapshot){
        var datos = snapshot.val();
        var result = "";
        var t1;
        var t2;
        for(var key in datos){
            teamsEnDB.orderByChild('teamKey').equalTo(datos[key].team1).on("value", function(snapshot2){
                snapshot2.forEach(function(data){
                    t1 = data.val();
                })
            })
            teamsEnDB.orderByChild('teamKey').equalTo(datos[key].team2).on("value", function(snapshot2){
                snapshot2.forEach(function(data){
                    t2 = data.val();
                })
            })
            result += '<div class="cajon"><div class="d-inline-block"><p>' + t1.teamName + '</p><img width="75px" height="75px" src="' + t1.teamLogo + '"/></div><div class="d-inline-block"><p>VS</p></div><div class="d-inline-block"><p>' + t2.teamName + '</p><img width="75px" height="75px" src="' + t2.teamLogo + '"/></div></br><img width="25px" height="25px" src="./img/delete.png" onclick="deleteDBM(\'' + datos[key].matchKey + '\')"></div>'
            document.getElementById("matchesLive").innerHTML = result
        }
    })
}

function deleteDBM(mKey){
    var adaRef = firebase.database().ref('matches/' + mKey);
    adaRef.remove()
    .then(function() {
        console.log("Remove succeeded.")
    })
    .catch(function(error) {
        console.log("Remove failed: " + error.message)
    });

}
mostrarMatch();

function teamsEnForm(){
    teamsEnDB.on("value",function(snapshot){
        var cont= "";
        var datos = snapshot.val();
        for(var key in datos){
            cont += '<option value=' + datos[key].teamKey + '>' + datos[key].teamName + '</option>'
        }
        document.getElementById("matchCreator1").innerHTML = cont;
        document.getElementById("matchCreator2").innerHTML = cont;
    })
}
teamsEnForm()

$('#createMatch').click(function(){
    var getKey=firebase.database().ref('matches').push(match)
    var match = {
        team1:$('#matchCreator1').val(),
        team2:$('#matchCreator2').val(),
        date:$('#matchDate').val(),
        time:$('#matchTime').val(),
        lname:$('#matchLocation').val(),
        lframe:$('#matchFrame').val(),
        matchKey:getKey.key
    }
    getKey.set(match)
    $('#matchCreator1').val('')
    $('#matchCreator2').val('')
    $('#matchDate').val('')
    $('#matchTime').val('')
    $('#matchLocation').val('')
    $('#matchFrame').val('')
})