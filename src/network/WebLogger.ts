
// Created by Richard Guo
// I based this upon UserManager.java from the repository EFAndroidHost. Highly recommend referencing that java file when working on this file.
// It logs data to the firebase database.
// If you want to turn it off, go to CEFTutorDoc.ts and comment out the constructor.
// If its not initialized, tutor will revert to default behavior of requiring FTR_DEV to start

export class WebLogger {
    public currScene:any;
    public currFeatures:string;
    public currTutorNdx:number;
    public currTutorState:string;
    
    /*public contructor(currScene:any, currFeatures:string) {
        this.currScene = currScene;
        this.currFeatures = currFeatures;
    }*/
    //private firebase:any;
    public constructor() {
        this.currScene = this.getCurrentScene();
        this.currFeatures = "FTR_WEB:FTR_CHOICE";   
    }

    public setValues(currScene:any, currFeatures:string) {
        this.currScene = currScene;
        this.currFeatures = currFeatures;
    }
    
    public updateTutorState(tutorID:string, tutorStateJSON:string) {
        console.log("LJSCR update Tutor State: ");

        //console.log(tutorStateJSON);
/*
        var xhr = new XMLHttpRequest();
        xhr.open("POST", 'http://localhost:3000/printstuff', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(tutorStateJSON);
*/
        /*db.collection(collectionID).doc(this.getUserId()).set({
            currTutorNdx: this.currTutorNdx,
            data: tutorStateJSON
        })
        .then(function() {
            console.log("Document successfully written!");
        })
        .catch(function(error:any) {
            console.error("Error writing document: ", error);
        });*/

        this.currTutorState = tutorStateJSON;

    }
    
    public async getTutorState(tutorID:string):Promise<string> {
        let jsonData = "";
        let docRef = db.collection(collectionID).doc(this.getUserId());
        await docRef.get().then((doc:any) => {
            if (doc.exists) {
                console.log("Document exists");
                jsonData = doc.data().rqted;
                this.currTutorNdx = doc.data().currTutorNdx;
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch(function(error:any) {
            console.log("Error getting document:", error);
        });
        //console.log("returned data: "+ jsonData);
        return jsonData;
    }
    
    public logState(scenename:string, scene:string, module:string, tutor:string) {
        console.log("LJSCR logState: ");

        let buffer:string = "{\"scene\":" + scene + "," + "\"module\":" + module + "," + "\"tutor\":" + tutor + "}";
/*
        try {
            logWriter = new FileWriter(getCurrentLogPath() + "/" + scenename + ".json");

            logWriter.write(buffer);
            logWriter.close();
        }
        catch(Exception e) {
            Log.e(TAG, "Log Write Failed : " + e);
        }*/
    }
    
    public getUserId() {
        let userid = userID;
        console.log("LJSCR get User ID: " + userid);
        return userid;
    }
    
    public getCurrentScene() {
        // this is sync request
        /*var xhr = new XMLHttpRequest();
        let jsonData = "";
        xhr.onreadystatechange = function() {
            //console.log(xhr.responseText);
            if (this.readyState == 4 && this.status == 200) {
                //alert(xhr.responseText);
                console.log("successfully got tutor state," + "readyState:"+this.readyState + ", status:" + this.status)
                jsonData = xhr.responseText;
                
            }
           
        }
        xhr.open('GET', 'http://localhost:3000/getCurrScene', false);
        xhr.send();
        return jsonData;*/
        return this.currScene;
    }
    
    public getFeatures() {
        console.log("LJSCR getFeatures: ");
        return this.currFeatures;
    }
    
    public tutorComplete() {
        this.currTutorNdx++;
        db.collection(collectionID).doc(this.getUserId()).set({
            currTutorNdx: this.currTutorNdx,
            rqted: this.currTutorState
        })
        .then(function() {
            console.log("Document successfully written!");
            console.log("LJSCR Tutor Complete: ");
            //alert("tutor complete");
            document.getElementById("completion-overlay").style.display = "block";
        })
        .catch(function(error:any) {
            console.error("Error writing document: ", error);
        });

        
        // i can do something cool here
        //window.location.href = 'https://www.google.com';
    }
    
    public updateScene(sceneName: string, sceneid: string) {
        console.log("LJSCR Updating Current Scene: " + sceneid);
        this.currScene = sceneid;
        /*var xhr = new XMLHttpRequest();
        xhr.open("POST", 'http://localhost:3000/currScene', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({currScene: this.currScene}));
*/
        if(sceneName.toLowerCase() == "ssceneend") {
            this.tutorComplete();
        }
        else {
            //this.updateUserPackage();
        }
    }

}



