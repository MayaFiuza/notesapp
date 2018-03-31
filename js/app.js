function getAccessToken() {
    if(localStorage.getItem('token') != null){
        return localStorage.getItem('token');
      }
      // Se é a primeira vez que ele vai fazer a autenticação.
    else{
        url = window.location.hash.slice(0, window.location.hash.indexOf("&"));
        url = url.slice(url.indexOf("=")+1);
        if(url == ''){
            return false;
        }else{
            createBasicStructure(url);
            localStorage.setItem('token', url);
            return url;
        }
    }
}
function createBasicStructure(token){
    console.log('Calling function createBasicStructure...');
    $.ajax({
        url: 'https://api.dropboxapi.com/2/files/list_folder',
        type: 'POST',
        data: JSON.stringify({path: ''}),
        datatype : "application/json",
        contentType: "application/json",
        headers: {
        "Authorization": "Bearer "+token
        },
    })
    .done(function(data) {
        if(data.entries.length == 0){
            create_folder('/annotations', token);
            create_folder('/myFiles', token);
            console.log('Creating the folders...');
        }else{
            console.log('Folders already exist!');
        }
    })
    .fail(function(error) {
        console.log('Create basic structure: error');
        console.log(error);
    });

    return false;
}
function create_folder(folder, token){
    $.ajax({
        url: 'https://api.dropboxapi.com/2/files/create_folder',
        type: 'POST',
        data: JSON.stringify({path: folder}),
        datatype : "application/json",
        contentType: "application/json",
        headers: {
        "Authorization": "Bearer "+token
        },
    }).done(function(data) {
        console.log('Folder "'+folder+'" created with success!');
    })
    .fail(function(error) {
        console.log('Create basic structure: error');
        console.log(error);
    });
    return false;
}
function getAnnotations(){
    console.log('Search the annotations...');
    localStorage.setItem('annotations', '');
    $.ajax({
        url: 'https://api.dropboxapi.com/2/files/list_folder',
        type: 'POST',
        data: JSON.stringify({path: '/annotations'}),
        datatype : "application/json",
        contentType: "application/json",
        headers: {
        "Authorization": "Bearer "+getAccessToken()
        },
    }).done(function(annotations) {
        console.log(annotations.entries.length+' files find with success!');
        for (var i =  0; i < annotations.entries.length; i++) {
            //console.log(annotations.entries[i]);
            if(annotations.entries[i].path_display.slice(annotations.entries[i].path_display.indexOf("."),annotations.entries[i].path_display.length) == '.json'){
                getTemporaryLink(annotations.entries[i].path_display);
                var file = {
                    id: annotations.entries[i].id,
                    name: annotations.entries[i].name,
                    path: annotations.entries[i].path_display,
                    data: annotations.entries[i].server_modified,
                    link: sessionStorage.getItem('annotationLink'),
                }
                addAnnotations(file, i);
            }else{
                console.log('The file "'+annotations.entries[i].path_display+'" not is a json');
            }
        }
    })
    .fail(function(error) {
        console.log('Error on search the annotations!');
        console.log(error);
    });
    return false; 
}
function getTemporaryLink(annotation){
    console.log('Getting the link of annotation....');
    $.ajax({
        url: 'https://api.dropboxapi.com/2/files/get_temporary_link',
        type: 'POST',
        data: JSON.stringify({path: annotation}),
        datatype : "application/json",
        contentType: "application/json",
        headers: {
        "Authorization": "Bearer "+getAccessToken()
        },
    }).done(function(data) {
        console.log('Get "'+annotation+'" link of annotations with success!');
        sessionStorage.setItem('annotationLink', data.link);
    })
    .fail(function(error) {
        console.log('Error on getting link of annotation!');
        console.log(error);
    });
    return false;
}
function addAnnotations(annotation, index){
    console.log('Adding the annotation "'+annotation.path+'" in LocalStorage!');
    if(localStorage.getItem('annotations') == ''){
        var annotations = [];
        annotations[0] = annotation;
        localStorage.setItem('annotations', JSON.stringify(annotations));
    }else{
        var annotations = JSON.parse(localStorage.getItem('annotations'));
        annotations[index] = annotation;
        localStorage.setItem('annotations', JSON.stringify(annotations));
    }
}
function isAuthenticated(){
    return !!getAccessToken();
}
$(document).ready(function() {
    if(isAuthenticated()){
        $('#login h1').html('Notesapp');
        $('#login .ui-content').html($('#loadAuthenticated').html());
        $('#loadAuthenticated').remove();
    }else{
        $('#loginForDropbox').attr('href', 'https://www.dropbox.com/1/oauth2/authorize?response_type=token&client_id=88mpcrjr1g5q8fo&redirect_uri='+window.location);
    }
});