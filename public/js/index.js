(function(){
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    var uiConfig = {
        callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            // User successfully signed in.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            return true;
        },
        uiShown: function() {
            document.getElementById('loader').style.display = 'none';
        }
        },
        signInFlow: 'popup',
        signInSuccessUrl: 'main.html',
        signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
            ],
        // Terms of service url.
        tosUrl: 'tas.html',
        // Privacy policy url.
        privacyPolicyUrl: 'privacy_policies.html'
    };
    ui.start('#firebaseui-auth-container', uiConfig);
})()
