
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
        this.currScene = null;
        this.currFeatures = "";
    }

    public setValues(currScene:any, currFeatures:string) {
        // console.log(`setting currFeatures to: ${currFeatures}`)
        this.currScene = currScene;
        this.currFeatures = currFeatures;
        if (currFeatures !== ispAPI.getFeaturesString()) {
            console.error("features are different");
        } else {
            console.log("features are the same");
        }
    }

    public getUserId() {
        // let userid = userID;
        // console.log("WebLogger::getUserId()", userid);
        return ispAPI.getUserID();
    }

    public getCurrentScene() {
        console.log("WebLogger.getCurrentScene()", this.currScene);
        return this.currScene;
    }

    public getFeatures() {
        // console.log("WebLogger::getFeatures(): ", this.currFeatures);
        return ispAPI.getFeaturesString();
    }

    public async getTutorState(tutorID:string):Promise<string> {
        console.log(`WebLogger::getTutorState("${tutorID}")`);
        return ispAPI.getAppData(false);
        // let jsonData = "";
        // let docRef = db.collection(collectionID).doc(this.getUserId());
        // await docRef.get().then((doc:any) => {
        //     if (doc.exists) {
        //         let feats = this.getFeatures().split(":");
        //         console.log(feats);
        //         console.log("WebLogger::Document exists");
        //         jsonData = doc.data().rqted;
        //         let obj = JSON.parse(jsonData);
        //         console.log(obj.fFeatures);
        //         let missingFeats = false;
        //         for (let feat of feats) {
        //             console.log(`testing for feature: ${feat}`);
        //             if (feat in obj.fFeatures) {
        //                 console.log(obj.fFeatures[feat]);
        //             } else {
        //                 console.log("nope");
        //                 missingFeats = true;
        //                 break;
        //             }
        //         }
        //         if (missingFeats) {
        //             console.log("feats mismatch. skipping");
        //             jsonData = "";
        //         }
        //         // console.log("returned data: ", jsonData);
        //         //JSON.stringify(json, null, 4));
        //         this.currTutorNdx = doc.data().currTutorNdx;
        //     } else {
        //         // doc.data() will be undefined in this case
        //         console.log("WebLogger::No such document!");
        //     }
        // }).catch(function(error:any) {
        //     console.log("Error getting document:", error);
        // });
        // return jsonData;
    }

    public logState(scenename:string, scene:string, module:string, tutor:string) {
        console.log("WebLogger::logState()");
        console.log("scenename", scenename);
        console.log("scene", scene);
        console.log("module", module);
        console.log("tutor", tutor);

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


    public updateTutorState(tutorID: string, tutorStateJSON: string) {
        console.log(`WebLogger::updateTutorState("${tutorID}")`);
        // console.log(tutorStateJSON);
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
        ispAPI.saveAppData(this.currTutorState)
        .then(() => console.log("WebLogger::state persisted to db"));
    }


    public tutorComplete() {
        console.log("WebLogger::tutorComplete()");
        ispAPI.saveAppData(this.currTutorState)
        .then(() => ispAPI.saveAppComplete())
        .then(() => ispAPI.goHomePage())
        .catch((error: any) => console.error(error));
        // this.currTutorNdx++;
        // db.collection(collectionID).doc(this.getUserId()).set({
        //     currTutorNdx: this.currTutorNdx,
        //     rqted: this.currTutorState
        // })
        // .then(function() {
        //     console.log("Document successfully written!");
        //     console.log("LJSCR Tutor Complete: ");
        //     //alert("tutor complete");
        //     document.getElementById("completion-overlay").style.display = "block";
        // })
        // .catch(function(error:any) {
        //     console.error("Error writing document: ", error);
        // });


        // i can do something cool here
        //window.location.href = 'https://www.google.com';
    }

    public updateScene(sceneName: string, sceneid: string) {
        console.log(`WebLogger::updateScene("${sceneName}", "${sceneid}")`);
        this.currScene = sceneid;
        /*
        var xhr = new XMLHttpRequest();
        xhr.open("POST", 'http://localhost:3000/currScene', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({currScene: this.currScene}));
        */
        if (sceneName.toLowerCase() == "ssceneend") {
            this.tutorComplete();
        }
        else {
            //this.updateUserPackage();
        }
    }
}



