var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("animationgraph/CAnimationChoice", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CAnimationChoice = (function () {
        function CAnimationChoice(data) {
            this._chosen = false;
            this._classname = data.classname;
            this._odds = data.odds.split('.');
        }
        CAnimationChoice.prototype.odds = function (ndx) {
            var result;
            if (this._chosen)
                result = 0;
            else
                result = this._odds[ndx];
            return result;
        };
        Object.defineProperty(CAnimationChoice.prototype, "count", {
            get: function () {
                return this._odds.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CAnimationChoice.prototype, "classname", {
            get: function () {
                return this._classname;
            },
            enumerable: true,
            configurable: true
        });
        CAnimationChoice.prototype.replace = function () {
            this._chosen = false;
        };
        CAnimationChoice.prototype.choose = function () {
            this._chosen = true;
        };
        return CAnimationChoice;
    }());
    exports.CAnimationChoice = CAnimationChoice;
});
define("animationgraph/CAnimationChoiceSet", ["require", "exports", "animationgraph/CAnimationNode", "animationgraph/CAnimationChoice"], function (require, exports, CAnimationNode_1, CAnimationChoice_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CAnimationChoiceSet = (function (_super) {
        __extends(CAnimationChoiceSet, _super);
        function CAnimationChoiceSet(target) {
            if (target === void 0) { target = null; }
            var _this = _super.call(this, target) || this;
            _this._choices = new Array;
            _this._iter = 0;
            _this._replace = true;
            return _this;
        }
        CAnimationChoiceSet.factory = function (parent, nodeName, moduleFactory) {
            var node = new CAnimationChoiceSet;
            if (moduleFactory.type == "node") {
                node.nodeFactory(parent, nodeName, moduleFactory);
                moduleFactory = parent._graphFactory.CChoiceSets[node._name];
            }
            var choices = moduleFactory.choices;
            for (var set in choices) {
                node._choices.push(new CAnimationChoice_1.CAnimationChoice(set));
            }
            node._replace = moduleFactory.replace;
            node._cycle = Number(moduleFactory.cycle);
            node._count = node._choices[0].count;
            return node;
        };
        CAnimationChoiceSet.prototype.nextAnimation = function () {
            var nextTrackClass = null;
            var choice;
            var curOdds = 0;
            var sampleSize;
            var rand;
            do {
                for (var _i = 0, _a = this._choices; _i < _a.length; _i++) {
                    var choice_1 = _a[_i];
                    sampleSize += choice_1.odds(this._iter);
                }
                if (sampleSize == 0) {
                    for (var _b = 0, _c = this._choices; _b < _c.length; _b++) {
                        choice = _c[_b];
                        choice.replace();
                    }
                }
            } while (sampleSize == 0);
            rand = Math.floor(Math.random() * sampleSize);
            for (var _d = 0, _e = this._choices; _d < _e.length; _d++) {
                var choice_2 = _e[_d];
                curOdds += choice_2.odds(this._iter);
                if (rand < curOdds) {
                    nextTrackClass = choice_2.classname;
                    if (!this._replace)
                        choice_2.choose();
                    this._iter++;
                    if (this._iter >= this._count) {
                        this._iter = this._count - this._cycle;
                    }
                    break;
                }
            }
            return nextTrackClass;
        };
        return CAnimationChoiceSet;
    }(CAnimationNode_1.CAnimationNode));
    exports.CAnimationChoiceSet = CAnimationChoiceSet;
});
define("animationgraph/CAnimationTrack", ["require", "exports", "animationgraph/CAnimationChoiceSet"], function (require, exports, CAnimationChoiceSet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CAnimationTrack = (function () {
        function CAnimationTrack(factory, parent) {
            this._parent = parent;
            if (factory.choiceset != undefined) {
                this._type = 'choiceset';
                this._choiceset = CAnimationChoiceSet_1.CAnimationChoiceSet.factory(this._parent, factory.choiceset, this._parent._graphFactory.CChoiceSets[factory.choiceset]);
            }
            else if (factory.classname != undefined) {
                this._type = 'actiontrack';
                this._classname = factory.classname;
            }
            this._features = factory.features;
            if (factory.$P != undefined) {
                this._pid = factory.pid;
                this._prob = factory.$P.split('|');
                this._cycle = Number(factory.cycle);
            }
        }
        CAnimationTrack.prototype.nextAnimation = function () {
            return this._choiceset.nextAnimation();
        };
        CAnimationTrack.prototype.testPFeature = function () {
            var iter = this._parent.queryPFeature(this._pid, this._prob.length, this._cycle);
            var rand = Math.random();
            return (rand < this._prob[iter]);
        };
        Object.defineProperty(CAnimationTrack.prototype, "hasPFeature", {
            get: function () {
                return (this._pid != null);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CAnimationTrack.prototype, "type", {
            get: function () {
                return this._type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CAnimationTrack.prototype, "features", {
            get: function () {
                return this._features;
            },
            set: function (newFTR) {
                this._features = newFTR;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CAnimationTrack.prototype, "classname", {
            get: function () {
                return this._classname;
            },
            enumerable: true,
            configurable: true
        });
        return CAnimationTrack;
    }());
    exports.CAnimationTrack = CAnimationTrack;
});
define("util/CUtil", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CUtil = (function (_super) {
        __extends(CUtil, _super);
        function CUtil() {
            return _super.call(this) || this;
        }
        CUtil.trace = function (message) {
            var alt = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                alt[_i - 1] = arguments[_i];
            }
            var fullMessage = "";
            if (message instanceof Array) {
            }
            else if (arguments.length > 1) {
                for (var item in arguments) {
                    fullMessage += fullMessage.concat(item, " ");
                }
                console.log(fullMessage);
            }
            else {
                console.log(message);
            }
        };
        CUtil.getTimer = function () {
            return ((CUtil.now && CUtil.now.call(CUtil.w.performance)) || (new Date().getTime()));
        };
        CUtil.getQualifiedClassName = function (value) {
            var type = typeof value;
            if (!value || (type != "object" && !value.prototype)) {
                return type;
            }
            var prototype = value.prototype ? value.prototype : Object.getPrototypeOf(value);
            if (prototype.hasOwnProperty("__class__")) {
                return prototype["__class__"];
            }
            var constructorString = prototype.constructor.toString().trim();
            var index = constructorString.indexOf("(");
            var className = constructorString.substring(9, index);
            Object.defineProperty(prototype, "__class__", {
                value: className,
                enumerable: false,
                writable: true
            });
            return className;
        };
        CUtil.prototype.getDefinitionByName = function (name) {
            if (!name)
                return null;
            var definition = CUtil.getDefinitionByNameCache[name];
            if (definition) {
                return definition;
            }
            var paths = name.split(".");
            var length = paths.length;
            definition = __global;
            for (var i = 0; i < length; i++) {
                var path = paths[i];
                definition = definition[path];
                if (!definition) {
                    return null;
                }
            }
            CUtil.getDefinitionByNameCache[name] = definition;
            return definition;
        };
        CUtil.w = window;
        CUtil.now = CUtil.w.performance.now || CUtil.w.performance.mozNow || CUtil.w.performance.msNow ||
            CUtil.w.performance.oNow || CUtil.w.performance.webkitNow;
        CUtil.getDefinitionByNameCache = {};
        return CUtil;
    }(Object));
    exports.CUtil = CUtil;
    var __global = this.__global || this;
});
define("mongo/MObject", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MObject = (function (_super) {
        __extends(MObject, _super);
        function MObject() {
            return _super.call(this) || this;
        }
        return MObject;
    }(Object));
    exports.MObject = MObject;
});
define("mongo/CObject", ["require", "exports", "mongo/MObject"], function (require, exports, MObject_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CObject = (function (_super) {
        __extends(CObject, _super);
        function CObject() {
            return _super.call(this) || this;
        }
        CObject.prototype.getValue = function (tarObj, path) {
            var objPath;
            var dataObj;
            try {
                dataObj = tarObj;
                objPath = path.split(".");
                while (objPath.length > 1)
                    dataObj = dataObj[objPath.shift()];
                return dataObj[objPath.shift()];
            }
            catch (err) {
                return "";
            }
        };
        CObject.prototype.setValue = function (tarObj, objPath, value) {
            var dataObj;
            var name;
            dataObj = tarObj;
            while (objPath.length > 1) {
                name = objPath.shift();
                if (dataObj[name] == null)
                    dataObj[name] = new Object;
                dataObj = dataObj[name];
            }
            dataObj[objPath.shift()] = value;
        };
        return CObject;
    }(MObject_1.MObject));
    exports.CObject = CObject;
});
define("mongo/CMongo", ["require", "exports", "util/CUtil", "mongo/MObject", "mongo/CObject"], function (require, exports, CUtil_1, MObject_2, CObject_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CMongo = (function () {
        function CMongo() {
        }
        CMongo.commandPacket = function (_source, _command, _collection, _query, _database) {
            if (_database === void 0) { _database = "TED"; }
            var packet;
            var multi = false;
            var type;
            var item;
            packet = '{"database":"' + _database + '","source":"' + _source + '","command":' + _command + ',"collection":"' + _collection + '","query":{';
            for (item in _query) {
                if (multi)
                    packet += ',';
                packet += '"' + item + '":';
                type = CUtil_1.CUtil.getQualifiedClassName(_query[item]);
                switch (type) {
                    case "string":
                        packet += '"' + _query[item] + '"';
                        break;
                    default:
                        packet += _query[item];
                        break;
                }
                multi = true;
            }
            packet += '}}';
            return packet;
        };
        CMongo.queryPacket = function (_source, _command, _collection, _query, _limit, _database) {
            if (_limit === void 0) { _limit = null; }
            if (_database === void 0) { _database = "TED"; }
            var packet;
            var multi = false;
            var multilimit = false;
            var type;
            var item;
            packet = '{"database":"' + _database + '","source":"' + _source + '","command":' + _command + ',"collection":"' + _collection + '","query":{';
            for (item in _query) {
                if (multi)
                    packet += ',';
                packet += '"' + item + '":';
                type = CUtil_1.CUtil.getQualifiedClassName(_query[item]);
                switch (type) {
                    case "string":
                        packet += '"' + _query[item] + '"';
                        break;
                    default:
                        packet += _query[item];
                        break;
                }
                multi = true;
            }
            packet += '}, "fields":{';
            for (item in _limit) {
                if (multilimit)
                    packet += ',';
                packet += '"' + item + '":';
                type = CUtil_1.CUtil.getQualifiedClassName(_limit[item]);
                switch (type) {
                    case "string":
                        packet += '"' + _limit[item] + '"';
                        break;
                    default:
                        packet += _limit[item];
                        break;
                }
                multilimit = true;
            }
            packet += '}}';
            return packet;
        };
        CMongo.recyclePacket = function (_source, _command, _collection, _query, recover) {
            var packet;
            var multi = false;
            packet = '{"source":"' + _source + '","command":' + _command + ',"collection":"' + _collection + '","query":{';
            for (var item in _query) {
                if (multi)
                    packet += ',';
                packet += '"' + item + '":"' + _query[item] + '"';
                multi = true;
            }
            packet += '}, "document":{"\$set":{"isActive":' + recover + '}}}';
            return packet;
        };
        CMongo.insertPacket = function (_source, _command, _collection, _objectDoc) {
            var packet;
            var multi = false;
            packet = '{"source":"' + _source + '","command":' + _command + ',"collection":"' + _collection + '","document":';
            packet += JSON.stringify(_objectDoc);
            packet += '}';
            return packet;
        };
        CMongo.updatePacket = function (_source, _command, _collection, _query, _updateObj) {
            var packet;
            var multi = false;
            var item;
            packet = '{"source":"' + _source + '","command":' + _command + ',"collection":"' + _collection + '","query":{';
            for (item in _query) {
                if (multi)
                    packet += ',';
                packet += '"' + item + '":"' + _query[item] + '"';
                multi = true;
            }
            multi = false;
            packet += '}, "document":{"\$set":{';
            packet += this.parseUpdateFields(_updateObj);
            packet += '}}}';
            return packet;
        };
        CMongo.unsetFieldPacket = function (_source, _command, _collection, _query, _updateObj) {
            var packet;
            var multi = false;
            var item;
            packet = '{"source":"' + _source + '","command":' + _command + ',"collection":"' + _collection + '","query":{';
            for (item in _query) {
                if (multi)
                    packet += ',';
                packet += '"' + item + '":"' + _query[item] + '"';
                multi = true;
            }
            multi = false;
            packet += '}, "document":{"\$unset":{';
            packet += this.parseUpdateFields(_updateObj);
            packet += '}}}';
            return packet;
        };
        CMongo.parseUpdateFields = function (node, objPath) {
            if (objPath === void 0) { objPath = ""; }
            var objString = "";
            var className;
            var fieldMark = false;
            for (var value in node) {
                className = CUtil_1.CUtil.getQualifiedClassName(node[value]);
                if (className == "Object") {
                    CUtil_1.CUtil.trace("type Error: parseUpdateFields");
                    throw (new Error("type Error: parseUpdateFields"));
                }
                if (node[value] instanceof CObject_1.CObject) {
                    if (fieldMark)
                        objString += ',';
                    fieldMark = false;
                    objString += this.parseUpdateFields(node[value], objPath + value + '.');
                }
                else {
                    if (objString.length > 0)
                        objString += ',';
                    objString += '"' + objPath + value + '"' + ':';
                    if (node[value] instanceof MObject_2.MObject)
                        objString += JSON.stringify(node[value]);
                    else {
                        if (typeof node[value] === "string")
                            objString += '"' + node[value] + '"';
                        else
                            objString += node[value];
                    }
                    fieldMark = true;
                }
            }
            return objString;
        };
        CMongo.encodeAsJSON = function (_fields, parent) {
            return JSON.stringify(this.encodeAsObject(null, _fields, parent));
        };
        CMongo.encodeAsObject = function (host, _fields, parent) {
            var tempObj = new Object;
            var leafObj;
            var subDocName;
            var pathArray;
            if (host == null)
                tempObj = new Object;
            else
                tempObj = host;
            for (var formID in _fields) {
                leafObj = tempObj;
                pathArray = _fields[formID].split(".");
                if (pathArray.length > 1) {
                    subDocName = pathArray.shift();
                    if (leafObj[subDocName] == undefined)
                        leafObj[subDocName] = new Object;
                    leafObj = this.objectBuilder(leafObj[subDocName], pathArray);
                }
                leafObj[pathArray[0]] = parent[formID].getItemData();
            }
            return tempObj;
        };
        CMongo.objectBuilder = function (leafObj, pathArray) {
            var subDocName;
            if (pathArray.length > 1) {
                subDocName = pathArray.shift();
                if (leafObj[subDocName] == undefined)
                    leafObj[subDocName] = new Object;
                leafObj = this.objectBuilder(leafObj, pathArray);
            }
            return leafObj;
        };
        CMongo.setValue = function (tarObj, path, value) {
            var objPath;
            var dataObj;
            var name;
            dataObj = tarObj;
            objPath = path.split(".");
            while (objPath.length > 1) {
                name = objPath.shift();
                if (dataObj[name] == null)
                    dataObj[name] = new CObject_1.CObject;
                dataObj = dataObj[name];
            }
            dataObj[objPath.shift()] = value;
        };
        CMongo.FIND = '"find"';
        CMongo.INSERT = '"insert"';
        CMongo.CREATEACCT = '"createacct"';
        CMongo.UPSERT = '"upsert"';
        CMongo.UPDATE = '"update"';
        CMongo.UNSET = '"unset"';
        CMongo.REMOVE = '"remove"';
        CMongo.RECYCLE = '"recycle"';
        CMongo.RECOVER = '"recover"';
        CMongo.DBCOMMAND = '"dbcommand"';
        CMongo.DBRUN_DBCOMMAND = "dbcommand";
        CMongo.DBRUN_LISTDBS = "listdatabases";
        CMongo.DBRUN_LISTCOLS = "listcollections";
        CMongo.DBRUN_DROPCOLLECTION = "dropcollection";
        CMongo.DBRUN_UPDATEDOCUMENT = "updatedocument";
        CMongo.ACK_FIND = 'find';
        CMongo.ACK_INSERT = 'insert';
        CMongo.ACK_CREATEACCT = 'createacct';
        CMongo.ACK_UPSERT = 'upsert';
        CMongo.ACK_UPDATE = 'update';
        CMongo.ACK_UNSET = 'unset';
        CMongo.ACK_REMOVE = 'remove';
        CMongo.ACK_RECYCLE = 'recycle';
        CMongo.ACK_RECOVER = 'recover';
        CMongo.ACK_DBCOMMAND = 'dbcommand';
        CMongo.QUERY_ALL = "";
        CMongo.LOG_PACKET = '"LOG_PACKET"';
        CMongo.LOG_TERMINATE = '"LOG_TERMINATE"';
        CMongo.LOG_PROGRESS = '"LOG_PROGRESS"';
        CMongo.ACKLOG_PACKET = 'LOG_PACKET';
        CMongo.ACKLOG_TERMINATE = 'LOG_TERMINATE';
        CMongo.ACKLOG_PROGRESS = 'LOG_PROGRESS';
        CMongo.ACKLOG_NAK = 'NAK_ERROR';
        CMongo._READY = "READY";
        CMongo._INPROGRESS = "IN PROGRESS";
        CMongo._COMPLETE = "COMPLETE";
        return CMongo;
    }());
    exports.CMongo = CMongo;
});
define("events/CEFEvent", ["require", "exports", "util/CUtil"], function (require, exports, CUtil_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Event = createjs.Event;
    var CEFEvent = (function (_super) {
        __extends(CEFEvent, _super);
        function CEFEvent(TarObjID, type, bubbles, cancelable) {
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            var _this = _super.call(this, type, bubbles, cancelable) || this;
            _this.tarObjID = TarObjID;
            return _this;
        }
        CEFEvent.prototype.clone = function () {
            CUtil_2.CUtil.trace("cloning WOZEvent:");
            return new CEFEvent(this.tarObjID, this.type, this.bubbles, this.cancelable);
        };
        CEFEvent.prototype.captureLogState = function (obj) {
            if (obj === void 0) { obj = null; }
            if (obj == null)
                obj = new Object;
            obj['target'] = this.tarObjID;
            obj['type'] = this.type;
            obj['bubbles'] = this.bubbles;
            obj['cancelable'] = this.cancelable;
            return obj;
        };
        CEFEvent.prototype.captureXMLState = function () {
            var xmlVal = "<CEFEvent target={tarObjID} type={type} bubbles={bubbles} cancelable={cancelable}/>";
            return xmlVal;
        };
        CEFEvent.prototype.restoreXMLState = function (xmlState) {
        };
        CEFEvent.prototype.compareXMLState = function (xmlState) {
            return false;
        };
        CEFEvent.prototype.trace = function (message) {
            var fullMessage = "";
            if (Array.isArray(message)) {
                for (var _i = 0, message_1 = message; _i < message_1.length; _i++) {
                    var item = message_1[_i];
                    fullMessage += fullMessage.concat(item, " ");
                }
                console.log(fullMessage);
            }
            else {
                fullMessage = message;
            }
            console.log(fullMessage);
        };
        CEFEvent.ENTER_FRAME = "enterFrame";
        CEFEvent.ADDED_TO_STAGE = "added";
        CEFEvent.REMOVED_FROM_STAGE = "removed";
        CEFEvent.MOTION_FINISH = "complete";
        CEFEvent.CHANGE = "change";
        CEFEvent.COMPLETE = "complete";
        return CEFEvent;
    }(Event));
    exports.CEFEvent = CEFEvent;
});
define("core/CEFDoc", ["require", "exports", "mongo/CMongo", "core/CEFRoot", "core/CEFTutorRoot", "events/CEFEvent", "util/CUtil"], function (require, exports, CMongo_1, CEFRoot_1, CEFTutorRoot_1, CEFEvent_1, CUtil_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFDoc = (function (_super) {
        __extends(CEFDoc, _super);
        function CEFDoc() {
            var _this = _super.call(this) || this;
            _this.logFrameID = 0;
            _this.logStateID = 0;
            CUtil_3.CUtil.trace("CEFDoc:Constructor");
            CEFDoc.gApp = _this;
            return _this;
        }
        CEFDoc.prototype.initOnStage = function (evt) {
            CUtil_3.CUtil.trace("CEFDoc:Object OnStage");
            this.connectFrameCounter(true);
        };
        CEFDoc.prototype.launchTutors = function () {
            this.resetStateFrameID();
            if (CEFRoot_1.CEFRoot.sessionAccount["session"].profile.progress == CMongo_1.CMongo._INPROGRESS) {
                CEFDoc.tutorAutoObj["SnavPanel"].instance.recoverState();
            }
            else {
                CEFDoc.tutorAutoObj["SnavPanel"].instance.gotoNextScene();
            }
        };
        CEFDoc.prototype.resetStateFrameID = function () {
            this.frameID = 0;
            this.stateID = 0;
        };
        Object.defineProperty(CEFDoc.prototype, "frameID", {
            get: function () {
                return this.logFrameID;
            },
            set: function (newVal) {
                this.logFrameID = newVal;
            },
            enumerable: true,
            configurable: true
        });
        CEFDoc.prototype.incFrameID = function () {
            this.logFrameID++;
        };
        Object.defineProperty(CEFDoc.prototype, "stateID", {
            get: function () {
                return this.logStateID;
            },
            set: function (newVal) {
                this.logStateID = newVal;
            },
            enumerable: true,
            configurable: true
        });
        CEFDoc.prototype.incStateID = function () {
            if (this.traceMode)
                CUtil_3.CUtil.trace("@@@@@@@@@ logStateID Update : " + this.logStateID);
            this.logStateID++;
            this.frameID = 0;
        };
        CEFDoc.prototype.connectFrameCounter = function (fCon) {
            if (fCon)
                addEventListener(CEFEvent_1.CEFEvent.ENTER_FRAME, this.doEnterFrame);
            else
                removeEventListener(CEFEvent_1.CEFEvent.ENTER_FRAME, this.doEnterFrame);
        };
        CEFDoc.prototype.doEnterFrame = function (evt) {
            this.incFrameID();
        };
        CEFDoc.prototype.dumpTutors = function () {
            if (this.traceMode)
                CUtil_3.CUtil.trace("\n*** Start root dump ALL tutors ***");
            for (var _i = 0, _a = CEFDoc.tutorAutoObj; _i < _a.length; _i++) {
                var tutor = _a[_i];
                if (this.traceMode)
                    CUtil_3.CUtil.trace("TUTOR : " + tutor);
                if (CEFDoc.tutorAutoObj[tutor].instance instanceof CEFTutorRoot_1.CEFTutorRoot) {
                    if (this.traceMode)
                        CUtil_3.CUtil.trace("CEF***");
                    CEFDoc.tutorAutoObj[tutor].instance.dumpScenes(CEFDoc.tutorAutoObj[tutor]);
                }
            }
            if (this.traceMode)
                CUtil_3.CUtil.trace("*** End root dump tutor structure ***");
        };
        CEFDoc.designWidth = 1024;
        CEFDoc.designHeight = 768;
        return CEFDoc;
    }(CEFRoot_1.CEFRoot));
    exports.CEFDoc = CEFDoc;
});
define("events/CEFMouseEvent", ["require", "exports", "util/CUtil"], function (require, exports, CUtil_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MouseEvent = createjs.MouseEvent;
    var CEFMouseEvent = (function (_super) {
        __extends(CEFMouseEvent, _super);
        function CEFMouseEvent(TarObjID, type, bubbles, cancelable, stageX, stageY, nativeEvent, pointerID, primary, rawX, rawY) {
            var _this = _super.call(this, type, bubbles, cancelable, stageX, stageY, nativeEvent, pointerID, primary, rawX, rawY) || this;
            _this.localX = rawX;
            _this.localY = rawY;
            return _this;
        }
        CEFMouseEvent.prototype.clone = function () {
            CUtil_4.CUtil.trace("cloning WOZEvent:");
            return new CEFMouseEvent(this.tarObjID, this.type, this.bubbles, this.cancelable, this.stageX, this.stageY, this.nativeEvent, this.pointerID, this.primary, this.rawX, this.rawY);
        };
        CEFMouseEvent.prototype.captureLogState = function (obj) {
            if (obj === void 0) { obj = null; }
            obj['event'] = 'CEFMouseEvent';
            obj['tarObjID'] = this.tarObjID;
            obj['localX'] = this.localX;
            obj['localY'] = this.localY;
            return obj;
        };
        CEFMouseEvent.prototype.captureXMLState = function () {
            var eventState = {};
            return eventState;
        };
        CEFMouseEvent.prototype.restoreXMLState = function (xmlState) {
        };
        CEFMouseEvent.prototype.compareXMLState = function (xmlState) {
            var bTest = true;
            return bTest;
        };
        CEFMouseEvent.MOUSE_MOVE = "mousemove";
        CEFMouseEvent.MOUSE_DOWN = "mousedown";
        CEFMouseEvent.MOUSE_UP = "mouseup";
        CEFMouseEvent.MOUSE_CLICK = "click";
        CEFMouseEvent.DOUBLE_CLICK = "dblclick";
        CEFMouseEvent.CLICK = "click";
        CEFMouseEvent.WOZCLICK = "WOZMOUSE_CLICK";
        CEFMouseEvent.WOZCLICKED = "WOZMOUSE_CLICKED";
        CEFMouseEvent.WOZDBLCLICK = "WOZMOUSE_DBLCLICKED";
        CEFMouseEvent.WOZMOVE = "WOZMOUSE_MOVE";
        CEFMouseEvent.WOZDOWN = "WOZMOUSE_DOWN";
        CEFMouseEvent.WOZUP = "WOZMOUSE_UP";
        CEFMouseEvent.WOZOVER = "WOZMOUSE_OVER";
        CEFMouseEvent.WOZOUT = "WOZMOUSE_OUT";
        CEFMouseEvent.WOZKEYDOWN = "WOZKEY_DOWN";
        CEFMouseEvent.WOZKEYUP = "WOZMKEY_UP";
        CEFMouseEvent.WOZNULL = "WOZNULL";
        return CEFMouseEvent;
    }(MouseEvent));
    exports.CEFMouseEvent = CEFMouseEvent;
});
define("events/CEFTextEvent", ["require", "exports", "util/CUtil", "events/CEFEvent"], function (require, exports, CUtil_5, CEFEvent_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFTextEvent = (function (_super) {
        __extends(CEFTextEvent, _super);
        function CEFTextEvent(TarObjID, Type, Index1, Index2, TextData, Bubbles, Cancelable) {
            if (Index1 === void 0) { Index1 = 0; }
            if (Index2 === void 0) { Index2 = 0; }
            if (TextData === void 0) { TextData = ""; }
            if (Bubbles === void 0) { Bubbles = false; }
            if (Cancelable === void 0) { Cancelable = false; }
            var _this = _super.call(this, TarObjID, Type, Bubbles, Cancelable) || this;
            _this.textdata = TextData;
            _this.index1 = Index1;
            _this.index2 = Index2;
            return _this;
        }
        CEFTextEvent.prototype.clone = function () {
            CUtil_5.CUtil.trace("cloning CEFTextEvent:");
            return new CEFTextEvent(this.tarObjID, this.type, this.index1, this.index2, this.textdata, this.bubbles, this.cancelable);
        };
        CEFTextEvent.WOZSETSELECTION = "wozSetSelection";
        CEFTextEvent.WOZSETSCROLL = "wozSetScroll";
        CEFTextEvent.WOZINPUTTEXT = "wozInputText";
        CEFTextEvent.WOZCAPTUREFOCUS = "wozCaptureFocus";
        CEFTextEvent.WOZRELEASEFOCUS = "wozReleaseFocus";
        return CEFTextEvent;
    }(CEFEvent_2.CEFEvent));
    exports.CEFTextEvent = CEFTextEvent;
});
define("core/CEFCursorProxy", ["require", "exports", "core/CEFRoot", "core/CEFObject", "core/CEFScene", "events/CEFMouseEvent", "events/CEFTextEvent", "util/CUtil"], function (require, exports, CEFRoot_2, CEFObject_1, CEFScene_1, CEFMouseEvent_1, CEFTextEvent_1, CUtil_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Point = createjs.Point;
    var Tween = createjs.Tween;
    var Ease = createjs.Ease;
    var CEFCursorProxy = (function (_super) {
        __extends(CEFCursorProxy, _super);
        function CEFCursorProxy() {
            var _this = _super.call(this) || this;
            _this.curObject = null;
            _this.actObject = null;
            _this.cLocation = new Point;
            _this.fSparkler = true;
            _this.fSparklerTest = false;
            _this.fSparklerDrag = false;
            _this.fLiveLog = false;
            _this.traceMode = false;
            if (_this.traceMode)
                CUtil_6.CUtil.trace("CEFCursorProxy:Constructor");
            _this.name = "WOZvCursor";
            _this.setCursorStyle("Sstandard");
            return _this;
        }
        CEFCursorProxy.prototype.setCursorStyle = function (style) {
            this.Sstandard.visible = false;
            this.Ssmallhand.visible = false;
            this.Shand.visible = false;
            this.Sautomate.visible = false;
            this[style].visible = true;
        };
        CEFCursorProxy.prototype.initWOZCursor = function (sMode) {
            if (this.traceMode)
                CUtil_6.CUtil.trace("Initializing WOZ Cursor Automation:");
            this.sAuto = sMode;
            if (sMode == CEFCursorProxy.WOZLIVE) {
                this.stage.addEventListener(CEFMouseEvent_1.CEFMouseEvent.MOUSE_MOVE, this.liveMouseMove);
                this.stage.addEventListener(CEFMouseEvent_1.CEFMouseEvent.MOUSE_DOWN, this.liveMouseDown);
                this.stage.addEventListener(CEFMouseEvent_1.CEFMouseEvent.MOUSE_UP, this.liveMouseUp);
                this.stage.addEventListener(CEFMouseEvent_1.CEFMouseEvent.DOUBLE_CLICK, this.liveMouseDblClick);
            }
            else if (sMode == CEFCursorProxy.WOZREPLAY) {
                this.stage.removeEventListener(CEFMouseEvent_1.CEFMouseEvent.MOUSE_MOVE, this.liveMouseMove);
                this.stage.removeEventListener(CEFMouseEvent_1.CEFMouseEvent.MOUSE_DOWN, this.liveMouseDown);
                this.stage.removeEventListener(CEFMouseEvent_1.CEFMouseEvent.MOUSE_UP, this.liveMouseUp);
                this.stage.removeEventListener(CEFMouseEvent_1.CEFMouseEvent.DOUBLE_CLICK, this.liveMouseDblClick);
            }
        };
        CEFCursorProxy.prototype.decodeTarget = function (baseObj, objArray) {
            var tmpObject = null;
            var subObject;
            subObject = objArray.shift();
            if (this.traceMode)
                CUtil_6.CUtil.trace("decoding: " + subObject);
            if ((subObject != "null") && (subObject != "none")) {
                tmpObject = baseObj[subObject];
                if (objArray.length)
                    tmpObject = this.decodeTarget(tmpObject, objArray);
            }
            return tmpObject;
        };
        CEFCursorProxy.prototype.initPlayBack = function () {
            this.lastFrameTime = 0;
        };
        CEFCursorProxy.prototype.playBackAction = function (wozEvt) {
            var traceAction = false;
            var tarObject;
            var objArray;
            if (traceAction)
                CUtil_6.CUtil.trace("PlayBack Action: " + wozEvt);
            if (wozEvt.CEFMouseEvent != undefined) {
                this.x = wozEvt.CEFMouseEvent.localX;
                this.y = wozEvt.CEFMouseEvent.localY;
                if (this.fSparklerTest) {
                    this.fSparklerTest = false;
                    if (wozEvt.CEFMouseEvent.CEFEvent.type.toString() == CEFMouseEvent_1.CEFMouseEvent.WOZMOVE)
                        this.fSparklerDrag = true;
                }
                if ((wozEvt.CEFMouseEvent.CEFEvent.type.toString() == CEFMouseEvent_1.CEFMouseEvent.WOZDOWN) && this.fSparkler) {
                    this.fSparklerDrag = false;
                    this.fSparklerTest = true;
                    this.Ssparkle.gotoAndPlay(2);
                }
                if ((wozEvt.CEFMouseEvent.CEFEvent.type.toString() == CEFMouseEvent_1.CEFMouseEvent.WOZUP) && this.fSparklerDrag)
                    this.Ssparkle.gotoAndPlay(10);
                if (traceAction)
                    CUtil_6.CUtil.trace("Splitting: " + wozEvt.CEFMouseEvent.CEFEvent.target + " EVT TYPE: " + wozEvt.CEFMouseEvent.CEFEvent.type);
                objArray = wozEvt.CEFMouseEvent.CEFEvent.target.split(".");
                if (traceAction)
                    CUtil_6.CUtil.trace("Target Array: " + objArray[0]);
                tarObject = this.decodeTarget(CEFRoot_2.CEFRoot.gTutor, objArray);
                if (tarObject) {
                    if (traceAction)
                        CUtil_6.CUtil.trace("Automation Target: " + tarObject + " Event: " + wozEvt.CEFMouseEvent.CEFEvent.type);
                    var evt = new CEFMouseEvent_1.CEFMouseEvent(tarObject.objID, wozEvt.CEFMouseEvent.CEFEvent.type, wozEvt.bubbles, wozEvt.cancelable, wozEvt.stageX, wozEvt.stageY, wozEvt.nativeEvent, wozEvt.pointerID, wozEvt.primary, wozEvt.rawX, wozEvt.rawY);
                    tarObject.dispatchEvent(evt);
                }
            }
            else if (wozEvt.CEFTextEvent != undefined) {
                if (traceAction)
                    CUtil_6.CUtil.trace("Splitting: " + wozEvt.CEFTextEvent.CEFEvent.target + " EVT TYPE: " + wozEvt.CEFTextEvent.CEFEvent.type);
                if (wozEvt.CEFTextEvent.CEFEvent.type == CEFTextEvent_1.CEFTextEvent.WOZINPUTTEXT) {
                    objArray = wozEvt.CEFTextEvent.CEFEvent.target.split(".");
                    if (traceAction)
                        CUtil_6.CUtil.trace("Target Array: " + objArray[0]);
                    tarObject = this.decodeTarget(CEFRoot_2.CEFRoot.gTutor, objArray);
                    if (tarObject) {
                        if (traceAction)
                            CUtil_6.CUtil.trace("Automation Target: " + tarObject + " Event: " + wozEvt.CEFTextEvent.CEFEvent.type);
                        var tEvt = new CEFTextEvent_1.CEFTextEvent(tarObject.objID, wozEvt.CEFTextEvent.CEFEvent.type, wozEvt.CEFTextEvent.index1, wozEvt.CEFTextEvent.index2, wozEvt.CEFTextEvent.text, true, false);
                        tarObject.dispatchEvent(tEvt);
                    }
                }
            }
        };
        CEFCursorProxy.prototype.playBackMove = function (nextMove, frameTime) {
            var relTime = (frameTime - this.lastFrameTime) / (nextMove.time - this.lastFrameTime);
            if (this.traceMode)
                CUtil_6.CUtil.trace("PlayBack Move");
            this.x += relTime * (nextMove.CEFMouseEvent.localX - this.x);
            this.y += relTime * (nextMove.CEFMouseEvent.localY - this.y);
            this.lastFrameTime = frameTime;
            if (this.traceMode)
                CUtil_6.CUtil.trace("-- Target X: " + nextMove.CEFMouseEvent.localX + " -- Target Y: " + nextMove.CEFMouseEvent.localY);
            if (this.traceMode)
                CUtil_6.CUtil.trace("-- Mouse  X: " + this.x + " -- Mouse  Y: " + this.y);
        };
        CEFCursorProxy.prototype.replayEvent = function (xEvt) {
            var tarObject;
            var objArray;
            this.x = xEvt.localX;
            this.y = xEvt.localY;
            if (this.fSparklerTest) {
                this.fSparklerTest = false;
                if (xEvt.CEFEvent.type.toString() == CEFMouseEvent_1.CEFMouseEvent.WOZMOVE)
                    this.fSparklerDrag = true;
            }
            if ((xEvt.CEFEvent.type.toString() == CEFMouseEvent_1.CEFMouseEvent.WOZDOWN) && this.fSparkler) {
                this.fSparklerDrag = false;
                this.fSparklerTest = true;
                this.Ssparkle.gotoAndPlay(2);
            }
            if ((xEvt.CEFEvent.type.toString() == CEFMouseEvent_1.CEFMouseEvent.WOZUP) && this.fSparklerDrag)
                this.Ssparkle.gotoAndPlay(10);
            if (this.traceMode)
                CUtil_6.CUtil.trace("Splitting: " + xEvt.CEFEvent.target + " EVT TYPE: " + xEvt.CEFEvent.type);
            objArray = xEvt.CEFEvent.target.split(".");
            if (this.traceMode)
                CUtil_6.CUtil.trace("Target Array: " + objArray[0]);
            tarObject = this.decodeTarget(CEFRoot_2.CEFRoot.gTutor, objArray);
            if (tarObject) {
                if (this.traceMode)
                    CUtil_6.CUtil.trace("Automation Target: " + tarObject + " Event: " + xEvt.CEFEvent.type);
                var evt = new CEFMouseEvent_1.CEFMouseEvent(tarObject.objID, xEvt.CEFEvent.type, xEvt.bubbles, xEvt.cancelable, xEvt.stageX, xEvt.stageY, xEvt.nativeEvent, xEvt.pointerID, xEvt.primary, xEvt.rawX, xEvt.rawY);
                tarObject.dispatchEvent(evt);
            }
        };
        CEFCursorProxy.prototype.replayEventB = function (xEvt) {
            var tarObject;
            this.x = xEvt.localX;
            this.y = xEvt.localY;
            tarObject = this.hitTestCoord(this.x, this.y);
            if (tarObject) {
                switch (xEvt.CEFEvent.type.toString()) {
                    case CEFMouseEvent_1.CEFMouseEvent.WOZMOVE:
                        return;
                    case CEFMouseEvent_1.CEFMouseEvent.WOZOUT:
                        tarObject = this.curObject;
                        break;
                    case CEFMouseEvent_1.CEFMouseEvent.WOZOVER:
                        this.curObject = tarObject;
                        break;
                    case CEFMouseEvent_1.CEFMouseEvent.WOZUP:
                        tarObject = this.actObject;
                        break;
                    case CEFMouseEvent_1.CEFMouseEvent.WOZDOWN:
                        this.actObject = this.curObject;
                        tarObject = this.curObject;
                        break;
                    case CEFMouseEvent_1.CEFMouseEvent.WOZCLICKED:
                        tarObject = this.actObject;
                        break;
                    case CEFMouseEvent_1.CEFMouseEvent.WOZDBLCLICK:
                        tarObject = this.actObject;
                        break;
                }
                if (this.traceMode)
                    CUtil_6.CUtil.trace("Automation Target: " + tarObject + " Event: " + xEvt.CEFEvent.type);
                var evt = new CEFMouseEvent_1.CEFMouseEvent(tarObject.objID, xEvt.CEFEvent.type, xEvt.bubbles, xEvt.cancelable, xEvt.stageX, xEvt.stageY, xEvt.nativeEvent, xEvt.pointerID, xEvt.primary, xEvt.rawX, xEvt.rawY);
                tarObject.dispatchEvent(evt);
            }
        };
        CEFCursorProxy.prototype.replayEventAndMove = function (xEvt, laEvt, l2Evt) {
            var tweens;
            var easingX;
            var easingY;
            var v1;
            var v2;
            var dX;
            var dY;
            this.replayEvent(xEvt);
            var replayTime = (laEvt.CEFEvent.evtTime - xEvt.CEFEvent.evtTime) / 1000;
            var replayTim2 = (l2Evt.CEFEvent.evtTime - laEvt.CEFEvent.evtTime) / 1000;
            if (replayTime > 0) {
                if (l2Evt == null) {
                    easingX = Ease.cubicOut;
                    easingY = Ease.cubicOut;
                }
                else {
                    dX = Math.abs(laEvt.localX - xEvt.localX);
                    v1 = dX / replayTime;
                    v2 = Math.abs(l2Evt.localX - laEvt.localX) / replayTim2;
                    if (this.traceMode)
                        CUtil_6.CUtil.trace("delta T:" + replayTime + " : " + replayTim2);
                    if (this.traceMode)
                        CUtil_6.CUtil.trace("X: v1/v2:  " + (v1 / v2));
                    if (dX < 10) {
                        if (this.traceMode)
                            CUtil_6.CUtil.trace("Easing X: Ease.linear");
                        easingX = Ease.linear;
                    }
                    else if ((v1 == 0) || (v2 == 0)) {
                        if (this.traceMode)
                            CUtil_6.CUtil.trace("Easing X: Ease.linear");
                        easingX = Ease.linear;
                    }
                    else if ((v1 / v2) > 3.5) {
                        if (this.traceMode)
                            CUtil_6.CUtil.trace("Easing X: Ease.cubicOut");
                        easingX = Ease.cubicOut;
                    }
                    else if ((v1 / v2) < .30) {
                        if (this.traceMode)
                            CUtil_6.CUtil.trace("Easing X: Ease.cubicIn");
                        easingX = Ease.cubicIn;
                    }
                    else {
                        if (this.traceMode)
                            CUtil_6.CUtil.trace("Easing X: Ease.linear");
                        easingX = Ease.linear;
                    }
                    dY = Math.abs(laEvt.localY - xEvt.localY);
                    v1 = dY / replayTime;
                    v2 = Math.abs(l2Evt.localY - laEvt.localY) / replayTim2;
                    if (this.traceMode)
                        CUtil_6.CUtil.trace("Y: v1/v2:  " + (v1 / v2));
                    if (dY < 10) {
                        if (this.traceMode)
                            CUtil_6.CUtil.trace("Easing X: Ease.linear");
                        easingY = Ease.linear;
                    }
                    else if ((v1 == 0) || (v2 == 0)) {
                        if (this.traceMode)
                            CUtil_6.CUtil.trace("Easing X: Ease.linear");
                        easingY = Ease.linear;
                    }
                    else if ((v1 / v2) > 3.5) {
                        if (this.traceMode)
                            CUtil_6.CUtil.trace("Easing Y: Ease.cubicOut");
                        easingY = Ease.cubicOut;
                    }
                    else if ((v1 / v2) < .30) {
                        if (this.traceMode)
                            CUtil_6.CUtil.trace("Easing Y: Ease.cubicIn");
                        easingY = Ease.cubicIn;
                    }
                    else {
                        if (this.traceMode)
                            CUtil_6.CUtil.trace("Easing Y: Ease.linear");
                        easingY = Ease.linear;
                    }
                }
                tweens = new Array;
                tweens[0] = new Tween(this).to({ x: laEvt.localX }, replayTime, easingX);
                tweens[1] = new Tween(this).to({ y: laEvt.localY }, replayTime, easingY);
            }
            return tweens;
        };
        CEFCursorProxy.prototype.replayMove = function (oldTime, laEvt) {
            var tweens;
            var replayTime = (laEvt.CEFEvent.evtTime - oldTime) / 1000;
            if (replayTime > 0) {
                tweens = new Array;
                tweens[0] = new Tween(this).to({ x: laEvt.localX }, replayTime, Ease.cubicInOut);
                tweens[1] = new Tween(this).to({ y: laEvt.localY }, replayTime, Ease.cubicInOut);
            }
            return tweens;
        };
        CEFCursorProxy.prototype.liveMouseMove = function (evt) {
            var evtMove;
            var fUpdate = false;
            var locX;
            var locY;
            locX = evt.stageX;
            locY = evt.stageY;
            if (this.x != locX) {
                this.x = locX;
                fUpdate = true;
            }
            if (this.y != locY) {
                this.y = locY;
                fUpdate = true;
            }
            if (fUpdate) {
                this.hitTestMouse(evt);
                if (this.curObject) {
                    if (this.traceMode)
                        CUtil_6.CUtil.trace("CEF Mouse Move : " + this.curObject.objID);
                    evtMove = new CEFMouseEvent_1.CEFMouseEvent("none", CEFMouseEvent_1.CEFMouseEvent.WOZMOVE, evt.bubbles, evt.cancelable, evt.stageX, evt.stageY, evt.nativeEvent, evt.pointerID, evt.primary, evt.rawX, evt.rawY);
                    if (this.fLiveLog)
                        this.gLogR.logLiveEvent(evtMove.captureLogState());
                    this.curObject.dispatchEvent(evtMove);
                }
                else {
                    if (this.traceMode)
                        CUtil_6.CUtil.trace("NULL Mouse Move : ");
                    evtMove = new CEFMouseEvent_1.CEFMouseEvent("none", CEFMouseEvent_1.CEFMouseEvent.WOZMOVE, evt.bubbles, evt.cancelable, evt.stageX, evt.stageY, evt.nativeEvent, evt.pointerID, evt.primary, evt.rawX, evt.rawY);
                    if (this.fLiveLog)
                        this.gLogR.logLiveEvent(evtMove.captureLogState());
                }
            }
        };
        CEFCursorProxy.prototype.liveMouseDown = function (evt) {
            var locX;
            var locY;
            locX = evt.stageX;
            locY = evt.stageY;
            this.hitTestMouse(evt);
            if (this.curObject) {
                if (this.traceMode)
                    CUtil_6.CUtil.trace("CEF Mouse Down : " + this.curObject.objID);
                var evtDown = new CEFMouseEvent_1.CEFMouseEvent(this.curObject.objID, CEFMouseEvent_1.CEFMouseEvent.WOZDOWN, evt.bubbles, evt.cancelable, evt.stageX, evt.stageY, evt.nativeEvent, evt.pointerID, evt.primary, evt.rawX, evt.rawY);
                if (this.fLiveLog)
                    this.gLogR.logLiveEvent(evtDown.captureLogState());
                this.curObject.dispatchEvent(evtDown);
                this.actObject = this.curObject;
            }
        };
        CEFCursorProxy.prototype.liveMouseUp = function (evt) {
            if (this.traceMode)
                CUtil_6.CUtil.trace("CEF Mouse Up : " + ((this.curObject) ? this.curObject.objID : "null"));
            var locX;
            var locY;
            if (this.actObject) {
                var evtUp = new CEFMouseEvent_1.CEFMouseEvent(this.actObject.objID, CEFMouseEvent_1.CEFMouseEvent.WOZUP, evt.bubbles, evt.cancelable, evt.stageX, evt.stageY, evt.nativeEvent, evt.pointerID, evt.primary, evt.rawX, evt.rawY);
                if (this.fLiveLog)
                    this.gLogR.logLiveEvent(evtUp.captureLogState());
                this.actObject.dispatchEvent(evtUp);
                if (this.actObject == this.curObject) {
                    if (this.traceMode)
                        CUtil_6.CUtil.trace("CEF Mouse Click : " + this.curObject.objID + "  At X:" + locX + "  Y:" + locY);
                    var evtClicked = new CEFMouseEvent_1.CEFMouseEvent(this.curObject.objID, CEFMouseEvent_1.CEFMouseEvent.WOZCLICKED, evt.bubbles, evt.cancelable, evt.stageX, evt.stageY, evt.nativeEvent, evt.pointerID, evt.primary, evt.rawX, evt.rawY);
                    if (this.fLiveLog)
                        this.gLogR.logLiveEvent(evtClicked.captureLogState());
                    this.curObject.dispatchEvent(evtClicked);
                }
            }
            this.actObject = null;
        };
        CEFCursorProxy.prototype.liveMouseDblClick = function (evt) {
            var locX;
            var locY;
            if (this.curObject) {
                if (this.traceMode)
                    CUtil_6.CUtil.trace("CEF Mouse Dbl Clicked: " + this.curObject.objID);
                var evtDblClick = new CEFMouseEvent_1.CEFMouseEvent(this.curObject.objID, CEFMouseEvent_1.CEFMouseEvent.WOZDBLCLICK, evt.bubbles, evt.cancelable, evt.stageX, evt.stageY, evt.nativeEvent, evt.pointerID, evt.primary, evt.rawX, evt.rawY);
                if (this.fLiveLog)
                    this.gLogR.logLiveEvent(evtDblClick.captureLogState());
                this.curObject.dispatchEvent(evtDblClick);
            }
        };
        CEFCursorProxy.prototype.stateHelper = function (tarObj) {
            var fTest = false;
            if (this.hitTestCoord(this.x, this.y) == tarObj)
                fTest = true;
            return fTest;
        };
        CEFCursorProxy.prototype.hitTestCoord = function (locX, locY) {
            var hitSet;
            var hitObj;
            var wozObj;
            this.cLocation.x = locX;
            this.cLocation.y = locY;
            hitSet = this.stage.getObjectsUnderPoint(locX, locY, 0);
            if (this.traceMode)
                CUtil_6.CUtil.trace("Hittest results  - cursor name: " + name);
            if (hitSet.length) {
                hitObj = hitSet[hitSet.length - 1];
                wozObj = this.isWOZObject(hitObj);
                if (!wozObj && (hitSet.length > 1)) {
                    hitObj = hitSet[hitSet.length - 2];
                    wozObj = this.isWOZObject(hitObj);
                }
            }
            if (wozObj)
                if (this.traceMode)
                    CUtil_6.CUtil.trace("HitTest WozObject Name - " + wozObj.name);
            return wozObj;
        };
        CEFCursorProxy.prototype.hitTestMouse = function (evt) {
            var hitObj;
            hitObj = this.hitTestCoord(this.x, this.y);
            if (hitObj || (!hitObj && (this.actObject == null)))
                this.updateCurrentObject(evt, hitObj);
        };
        CEFCursorProxy.prototype.show = function (bFlag) {
            if (bFlag) {
                if (this.traceMode)
                    CUtil_6.CUtil.trace("Hiding Hardware Mouse : ");
                document.getElementById("canvas").style.cursor = "none";
                this.visible = true;
            }
            else {
                if (this.traceMode)
                    CUtil_6.CUtil.trace("Showing Hardware Mouse : ");
                document.getElementById("canvas").style.cursor = "none";
                this.visible = false;
            }
        };
        CEFCursorProxy.prototype.updateCurrentObject = function (evt, hitObj) {
            if (this.traceMode)
                (hitObj) ? CUtil_6.CUtil.trace("updateCurrentObject hitObj: " + hitObj.objID) : CUtil_6.CUtil.trace("updateCurrentObject hitObj: null");
            var locX;
            var locY;
            locX = evt.stageX;
            locY = evt.stageY;
            if (hitObj == this.curObject)
                return;
            else {
                if (this.curObject) {
                    if (this.traceMode)
                        CUtil_6.CUtil.trace("CEF Mouse Out : " + this.curObject.objID);
                    var evtOut = new CEFMouseEvent_1.CEFMouseEvent(this.curObject.objID, CEFMouseEvent_1.CEFMouseEvent.WOZOUT, evt.bubbles, evt.cancelable, evt.stageX, evt.stageY, evt.nativeEvent, evt.pointerID, evt.primary, evt.rawX, evt.rawY);
                    if (this.fLiveLog)
                        this.gLogR.logLiveEvent(evtOut.captureLogState());
                    this.curObject.dispatchEvent(evtOut);
                }
                this.curObject = hitObj;
                if (this.curObject) {
                    if (this.traceMode)
                        CUtil_6.CUtil.trace("CEF Mouse Over: " + this.curObject.objID);
                    var evtOver = new CEFMouseEvent_1.CEFMouseEvent(this.curObject.objID, CEFMouseEvent_1.CEFMouseEvent.WOZOVER, evt.bubbles, evt.cancelable, evt.stageX, evt.stageY, evt.nativeEvent, evt.pointerID, evt.primary, evt.rawX, evt.rawY);
                    if (this.fLiveLog)
                        this.gLogR.logLiveEvent(evtOver.captureLogState());
                    this.curObject.dispatchEvent(evtOver);
                }
            }
        };
        CEFCursorProxy.prototype.isWOZObject = function (tObj) {
            if (!tObj || tObj instanceof CEFScene_1.CEFScene)
                return null;
            else if (tObj instanceof CEFObject_1.CEFObject)
                return tObj;
            return this.isWOZObject(tObj.parent);
        };
        CEFCursorProxy.WOZLIVE = "WOZLIVE";
        CEFCursorProxy.WOZREPLAY = "WOZREPLAY";
        return CEFCursorProxy;
    }(CEFRoot_2.CEFRoot));
    exports.CEFCursorProxy = CEFCursorProxy;
});
define("core/CEFAnimator", ["require", "exports", "core/CEFRoot", "core/CEFDoc", "util/CUtil", "events/CEFEvent"], function (require, exports, CEFRoot_3, CEFDoc_1, CUtil_7, CEFEvent_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFAnimator = (function (_super) {
        __extends(CEFAnimator, _super);
        function CEFAnimator() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.Running = new Array();
            _this.started = 0;
            _this.runCount = 0;
            return _this;
        }
        CEFAnimator.prototype.CEFAnimator = function () {
        };
        CEFAnimator.prototype.startTransition = function (xnF) {
            if (xnF === void 0) { xnF = null; }
            if (this.traceMode)
                CUtil_7.CUtil.trace("startTransition : " + this.runCount);
            var i1;
            this.xnFinalize = xnF;
            if (this.Running.length == 0) {
                this.xnCleanup();
            }
            for (var i1_1 = this.started; i1_1 < this.Running.length; i1_1++) {
                this.runCount++;
                this.Running[i1_1].addEventListener(CEFEvent_3.CEFEvent.MOTION_FINISH, this.xnFinished);
                this.Running[i1_1].start();
            }
            this.started = this.runCount;
            if (this.traceMode)
                CUtil_7.CUtil.trace("Transition Running: ", this.runCount);
        };
        CEFAnimator.prototype.xnCleanup = function () {
            if (this.traceMode)
                CUtil_7.CUtil.trace("xn Flush Queue ");
            this.stopTransitions();
            if (this.xnFinalize != null)
                this.xnFinalize.call(this);
            CEFDoc_1.CEFDoc.gApp.incStateID();
        };
        CEFAnimator.prototype.xnFinished = function (evt) {
            if (this.traceMode)
                CUtil_7.CUtil.trace("xnFinished : ", this.runCount, evt.currentTarget.obj, evt.currentTarget.obj.name, evt.currentTarget.prop);
            var targTwn = evt.currentTarget;
            var targObj = evt.currentTarget.obj;
            targTwn.stop();
            targTwn.removeEventListener(CEFEvent_3.CEFEvent.MOTION_FINISH, this.xnFinished);
            this.runCount--;
            if (targObj.alpha == 0)
                targObj.visible = false;
            if (!this.runCount) {
                this.xnCleanup();
            }
        };
        CEFAnimator.prototype.stopTransitions = function () {
            if (this.traceMode)
                CUtil_7.CUtil.trace("stop Transition");
            var i1;
            var runtween;
            while (runtween = this.Running.pop()) {
                runtween.removeEventListener(CEFEvent_3.CEFEvent.MOTION_FINISH, this.xnFinished);
                runtween.pause(runtween);
            }
            this.runCount = 0;
            this.started = 0;
        };
        return CEFAnimator;
    }(CEFRoot_3.CEFRoot));
    exports.CEFAnimator = CEFAnimator;
});
define("core/CEFObjectMask", ["require", "exports", "core/CEFObject"], function (require, exports, CEFObject_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFObjectMask = (function (_super) {
        __extends(CEFObjectMask, _super);
        function CEFObjectMask() {
            return _super.call(this) || this;
        }
        return CEFObjectMask;
    }(CEFObject_2.CEFObject));
    exports.CEFObjectMask = CEFObjectMask;
});
define("core/CEFTransitions", ["require", "exports", "core/CEFRoot", "core/CEFAnimator", "core/CEFObject", "core/CEFObjectMask", "events/CEFEvent", "util/CUtil"], function (require, exports, CEFRoot_4, CEFAnimator_1, CEFObject_3, CEFObjectMask_1, CEFEvent_4, CUtil_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Tween = createjs.Tween;
    var Ease = createjs.Ease;
    var CEFTransitions = (function (_super) {
        __extends(CEFTransitions, _super);
        function CEFTransitions() {
            var _this = _super.call(this) || this;
            _this.currScene = "Sscene0";
            _this.newScene = null;
            _this.rTime = .25;
            _this.tTime = .25;
            _this.fSingleStep = true;
            _this.activeObjs = new Object;
            _this.persistObjs = new Object;
            _this.fSwapObjects = false;
            _this.traceMode = false;
            if (_this.traceMode)
                CUtil_8.CUtil.trace("CEFTransitions:Constructor");
            return _this;
        }
        CEFTransitions.prototype.connectToTutor = function (parentTutor, autoTutor) {
            this.prntTutor = parentTutor;
            this.tutorAutoObj = autoTutor;
            this.activeObjs = new Object;
        };
        CEFTransitions.prototype.resetTransitions = function () {
            this.activeObjs = new Object;
        };
        CEFTransitions.prototype.walkTweens = function () {
            var i1;
            if (this.traceMode)
                CUtil_8.CUtil.trace("Tween Enumeration for Scene: ", this.currScene);
            for (i1 = 0; i1 < this.Running.length; i1++) {
                if (this.traceMode)
                    CUtil_8.CUtil.trace("Object Value: ", this.Running[i1].obj);
            }
        };
        CEFTransitions.prototype.gotoScene = function (scn) {
            if (this.traceMode)
                CUtil_8.CUtil.trace("Goto Scene: ", scn);
            this.fSingleStep = false;
            this.stopTransitions();
            this.newScene = scn;
            if (this.currScene != null) {
                this.setTransitionOUT();
                if (this.Running.length)
                    this.startTransition(this.outFinished);
                else {
                    this.setTransitionIN(this.tutorAutoObj, this.newScene);
                    this.changeScene();
                    this.startTransition(this.inFinished);
                    if (!this.started)
                        this.inFinished();
                }
            }
            else {
                this.setTransitionIN(this.tutorAutoObj, this.newScene);
                this.changeScene();
                this.startTransition(this.inFinished);
            }
        };
        CEFTransitions.prototype.setTransitionOUT = function () {
            var bMatch;
            var targObj;
            var tween;
            if (this.currScene != null)
                for (var _i = 0, _a = this.tutorAutoObj[this.currScene]; _i < _a.length; _i++) {
                    var sceneObj = _a[_i];
                    bMatch = false;
                    if (sceneObj == "instance")
                        continue;
                    if (this.newScene != null) {
                        if (this.tutorAutoObj[this.newScene][sceneObj] != undefined) {
                            if (this.tutorAutoObj[this.currScene][sceneObj].instance instanceof CEFObject_3.CEFObject) {
                                if (this.traceMode)
                                    CUtil_8.CUtil.trace("newObject: " + this.tutorAutoObj[this.newScene][sceneObj].instance.wozName);
                                if (this.traceMode)
                                    CUtil_8.CUtil.trace("oldObject: " + this.tutorAutoObj[this.currScene][sceneObj].instance.wozName);
                                if (this.tutorAutoObj[this.newScene][sceneObj].instance.wozName == this.tutorAutoObj[this.currScene][sceneObj].instance.wozName)
                                    bMatch = true;
                            }
                            else
                                bMatch = true;
                        }
                    }
                    if (!bMatch) {
                        if (this.traceMode)
                            CUtil_8.CUtil.trace("setTransitionOUT: " + this.tutorAutoObj[this.currScene][sceneObj].instance.name);
                        targObj = this.tutorAutoObj[this.currScene][sceneObj];
                        tween = new Tween(targObj.instance).to({ alpha: 0 }, Number(this.rTime), Ease.cubicInOut);
                        this.Running.push(tween);
                    }
                }
        };
        CEFTransitions.prototype.setTransitionIN = function (objectList, objectName) {
            var targObj;
            var liveObj;
            var tween;
            var wozName;
            this.currentObjs = new Array;
            for (var _i = 0, _a = objectList[objectName]; _i < _a.length; _i++) {
                var namedObj = _a[_i];
                if (namedObj != "instance") {
                    targObj = objectList[objectName][namedObj];
                    if (targObj.instance instanceof CEFObject_3.CEFObject) {
                        if (!targObj.instance.isTweenable())
                            continue;
                        wozName = targObj.instance.wozName;
                    }
                    else
                        wozName = namedObj;
                    if (this.activeObjs[wozName] != undefined) {
                        liveObj = this.activeObjs[wozName];
                        if (this.fSwapObjects) {
                            var dO1 = this.tutorAutoObj[this.currScene][namedObj].instance;
                            var dO2 = this.tutorAutoObj[this.newScene][namedObj].instance;
                            var dI1 = CEFRoot_4.CEFRoot.gTutor[this.currScene].getChildIndex(dO1);
                            var dI2 = CEFRoot_4.CEFRoot.gTutor[this.newScene].getChildIndex(dO2);
                            CEFRoot_4.CEFRoot.gTutor[this.currScene].addChildAt(dO2, dI1);
                            CEFRoot_4.CEFRoot.gTutor[this.newScene].addChildAt(dO1, dI2);
                            this.tutorAutoObj[this.currScene][namedObj].instance = dO2;
                            this.tutorAutoObj[this.newScene][namedObj].instance = dO1;
                            targObj = objectList[objectName][namedObj];
                        }
                        else {
                            if ((liveObj instanceof CEFObject_3.CEFObject) && (targObj.instance.tweenID == liveObj.tweenID)) {
                                targObj.instance.deepStateCopy(liveObj);
                            }
                            else
                                this.shallowStateCopy(targObj.instance, liveObj);
                        }
                        if (targObj.inPlace.X != liveObj.x) {
                            tween = new Tween(targObj.instance).to({ x: targObj.inPlace.X }, this.tTime, Ease.cubicInOut);
                            if (this.traceMode)
                                CUtil_8.CUtil.trace("Tweening obj in scene: " + objectName + "  named : " + targObj.name + " property: " + targObj.prop + " in: " + tween.duration + "secs");
                            this.Running.push(tween);
                        }
                        if (targObj.inPlace.Y != liveObj.y) {
                            tween = new Tween(targObj.instance).to({ y: targObj.inPlace.Y }, this.tTime, Ease.cubicInOut);
                            if (this.traceMode)
                                CUtil_8.CUtil.trace("Tweening obj in scene: " + objectName + "  named : " + targObj.name + " property: " + targObj.prop + " in: " + tween.duration + "secs");
                            this.Running.push(tween);
                        }
                        if (targObj.inPlace.Alpha != liveObj.alpha) {
                            tween = new Tween(targObj.instance).to({ alpha: targObj.inPlace.Alpha }, this.tTime, Ease.cubicInOut);
                            if (this.traceMode)
                                CUtil_8.CUtil.trace("Tweening obj in scene: " + objectName + "  named : " + targObj.name + " property: " + targObj.prop + " in: " + tween.duration + "secs");
                            this.Running.push(tween);
                        }
                    }
                    else {
                        if (!(targObj.instance instanceof CEFObjectMask_1.CEFObjectMask))
                            targObj.instance.alpha = 0;
                        tween = new Tween(targObj.instance).to({ alpha: targObj.inPlace.Alpha }, this.tTime, Ease.cubicInOut);
                        if (this.traceMode)
                            CUtil_8.CUtil.trace("Tweening obj in scene: " + objectName + "  named : " + targObj.name + " property: " + targObj.prop + " in: " + tween.duration + "secs");
                        this.Running.push(tween);
                    }
                    if (targObj.instance instanceof CEFObject_3.CEFObject) {
                        if (!targObj.instance.hidden)
                            targObj.instance.visible = true;
                        if (targObj.instance.bPersist) {
                            this.persistObjs[wozName] = targObj.instance;
                        }
                        else {
                            this.currentObjs.push(new Array(wozName, targObj.instance));
                        }
                        if (targObj.instance.isSubTweenable()) {
                            if (this.traceMode)
                                CUtil_8.CUtil.trace("SubTweening : " + targObj.instance.name);
                            this.setTransitionIN(objectList[objectName], namedObj);
                        }
                    }
                    else {
                        targObj.instance.visible = true;
                        this.currentObjs.push(new Array(wozName, targObj.instance));
                    }
                }
            }
            this.activeObjs = new Object;
            for (var _b = 0, _c = this.currentObjs; _b < _c.length; _b++) {
                var objRec = _c[_b];
                this.activeObjs[objRec[0]] = objRec[1];
            }
            for (var _d = 0, _e = this.persistObjs; _d < _e.length; _d++) {
                var perObj = _e[_d];
                this.activeObjs[perObj.wozName] = perObj;
            }
        };
        CEFTransitions.prototype.changeScene = function () {
            this.tutorAutoObj[this.currScene].instance.visible = false;
            this.tutorAutoObj[this.newScene].instance.visible = true;
            this.currScene = this.newScene;
        };
        CEFTransitions.prototype.shallowStateCopy = function (tar, src) {
            tar.x = src.x;
            tar.y = src.y;
            tar.alpha = src.alpha;
        };
        CEFTransitions.prototype.xnFinished = function (evt) {
            if (evt.currentTarget.obj.alpha == 0)
                evt.currentTarget.obj.visible = false;
            _super.prototype.xnFinished.call(this, evt);
        };
        CEFTransitions.prototype.outFinished = function () {
            CUtil_8.CUtil.trace("outFinished");
            if (!this.fSingleStep) {
                if (this.newScene) {
                    if (this.tutorAutoObj[this.newScene].instance.visible == false) {
                        this.setTransitionIN(this.tutorAutoObj, this.newScene);
                    }
                    this.changeScene();
                    this.startTransition(this.inFinished);
                }
            }
            else
                this.dispatchEvent(new Event(CEFEvent_4.CEFEvent.CHANGE));
        };
        CEFTransitions.prototype.inFinished = function () {
            CUtil_8.CUtil.trace("inFinished");
            this.currScene = this.newScene;
            this.dispatchEvent(new Event(CEFEvent_4.CEFEvent.COMPLETE));
        };
        return CEFTransitions;
    }(CEFAnimator_1.CEFAnimator));
    exports.CEFTransitions = CEFTransitions;
});
define("core/CEFButton", ["require", "exports", "core/CEFRoot", "core/CEFObject", "events/CEFMouseEvent", "util/CUtil"], function (require, exports, CEFRoot_5, CEFObject_4, CEFMouseEvent_2, CUtil_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFButton = (function (_super) {
        __extends(CEFButton, _super);
        function CEFButton() {
            var _this = _super.call(this) || this;
            _this.curState = "Sup";
            _this.fPressed = false;
            _this.fEnabled = true;
            _this.fOver = false;
            _this.onClickScript = null;
            _this.traceMode = false;
            if (_this.traceMode)
                CUtil_9.CUtil.trace("CEFButton:Constructor");
            _this.gotoState("Sup");
            _this.enableButton(true);
            return _this;
        }
        CEFButton.prototype.Destructor = function () {
            this.removeEventListener(CEFMouseEvent_2.CEFMouseEvent.WOZCLICKED, this.doMouseClicked);
            this.removeEventListener(CEFMouseEvent_2.CEFMouseEvent.WOZOVER, this.doMouseOver);
            this.removeEventListener(CEFMouseEvent_2.CEFMouseEvent.WOZOUT, this.doMouseOut);
            this.removeEventListener(CEFMouseEvent_2.CEFMouseEvent.WOZDOWN, this.doMouseDown);
            this.removeEventListener(CEFMouseEvent_2.CEFMouseEvent.WOZUP, this.doMouseUp);
            _super.prototype.Destructor.call(this);
        };
        CEFButton.prototype.captureDefState = function (TutScene) {
            _super.prototype.captureDefState.call(this, TutScene);
        };
        CEFButton.prototype.restoreDefState = function (TutScene) {
            if (this.traceMode)
                CUtil_9.CUtil.trace("Button Reseting: " + name);
            this.curState = "unknown";
            this.fPressed = false;
            this.fEnabled = true;
            this.fOver = false;
            this.enableButton(true);
            _super.prototype.restoreDefState.call(this, TutScene);
        };
        CEFButton.prototype.captureLogState = function (obj) {
            if (obj === void 0) { obj = null; }
            obj = _super.prototype.captureLogState.call(this, obj);
            obj['target'] = 'button';
            obj['name'] = name;
            obj['state'] = this.curState;
            obj['pressed'] = this.fPressed.toString();
            obj['enabled'] = this.fEnabled.toString();
            obj['over'] = this.fOver.toString();
            return obj;
        };
        CEFButton.prototype.capturestringState = function () {
            var stringVal = "<button name={name} state={curState} pressed={fPressed.toString()} enabled={fEnabled.toString()} over={fOver.toString()}/>";
            return stringVal;
        };
        CEFButton.prototype.resetState = function () {
            this["Sup"].visible = true;
            this["Sover"].visible = false;
            this["Sdown"].visible = false;
            this["Sdisabled"].visible = false;
            this["Sfocus"].visible = false;
        };
        CEFButton.prototype.gotoState = function (sState) {
            if (this.traceMode)
                CUtil_9.CUtil.trace("CEFButton.gotoState: ", name + " " + sState);
            this.resetState();
            this.curState = sState;
            if (!this.fEnabled) {
                this["Sover"].visible = false;
                this["Sup"].visible = false;
                this["Sdisabled"].visible = true;
                this.fPressed = false;
            }
            else
                switch (sState) {
                    case "Sdown":
                        this["Sdown"].visible = true;
                        this.fPressed = true;
                        break;
                    case "Sup":
                        if (this.fOver)
                            this["Sover"].visible = true;
                        else
                            this["Sup"].visible = true;
                        this.fPressed = false;
                        break;
                    case "Sover":
                        if (!this.fPressed)
                            this["Sover"].visible = true;
                        else
                            this["Sdown"].visible = true;
                        this.fOver = true;
                        break;
                    case "Sout":
                        this["Sup"].visible = true;
                        this.fOver = false;
                        break;
                }
        };
        CEFButton.prototype.muteButton = function (bMute) {
            if (bMute) {
                if (this.traceMode)
                    CUtil_9.CUtil.trace("Button Muted: " + name);
                this.removeEventListener(CEFMouseEvent_2.CEFMouseEvent.WOZCLICKED, this.doMouseClicked);
                this.removeEventListener(CEFMouseEvent_2.CEFMouseEvent.WOZOVER, this.doMouseOver);
                this.removeEventListener(CEFMouseEvent_2.CEFMouseEvent.WOZOUT, this.doMouseOut);
                this.removeEventListener(CEFMouseEvent_2.CEFMouseEvent.WOZDOWN, this.doMouseDown);
                this.removeEventListener(CEFMouseEvent_2.CEFMouseEvent.WOZUP, this.doMouseUp);
            }
            else {
                if (this.traceMode)
                    CUtil_9.CUtil.trace("Button UnMuted: " + name);
                this.addEventListener(CEFMouseEvent_2.CEFMouseEvent.WOZCLICKED, this.doMouseClicked);
                this.addEventListener(CEFMouseEvent_2.CEFMouseEvent.WOZOVER, this.doMouseOver);
                this.addEventListener(CEFMouseEvent_2.CEFMouseEvent.WOZOUT, this.doMouseOut);
                this.addEventListener(CEFMouseEvent_2.CEFMouseEvent.WOZDOWN, this.doMouseDown);
                this.addEventListener(CEFMouseEvent_2.CEFMouseEvent.WOZUP, this.doMouseUp);
            }
        };
        CEFButton.prototype.enableButton = function (bFlag) {
            this.fEnabled = bFlag;
            if (!bFlag) {
                if (this.traceMode)
                    CUtil_9.CUtil.trace("Button Disabled: " + name);
                this.gotoState(this.curState);
                this.muteButton(true);
            }
            else {
                if (this.traceMode)
                    CUtil_9.CUtil.trace("Button Enabled: " + name);
                this.gotoState(this.curState);
                this.muteButton(false);
            }
        };
        CEFButton.prototype.doMouseClicked = function (evt) {
            if (this.traceMode)
                CUtil_9.CUtil.trace("dispatch WOZCLICK");
            this.dispatchEvent(new CEFMouseEvent_2.CEFMouseEvent("", CEFMouseEvent_2.CEFMouseEvent.WOZCLICK, evt.bubbles, evt.cancelable, evt.stageX, evt.stageY, evt.nativeEvent, evt.pointerID, evt.primary, evt.rawX, evt.rawY));
            if (this.onClickScript != null)
                this.doClickAction(evt);
            var logData = { 'action': 'button_click', 'targetid': name };
            this.gLogR.logActionEvent(logData);
        };
        CEFButton.prototype.doClickAction = function (evt) {
            try {
            }
            catch (e) {
                CUtil_9.CUtil.trace("Error in onClick script: " + this.onClickScript);
            }
        };
        CEFButton.prototype.doMouseOver = function (evt) {
            this.gotoState("Sover");
        };
        CEFButton.prototype.doMouseOut = function (evt) {
            this.gotoState("Sout");
        };
        CEFButton.prototype.doMouseDown = function (evt) {
            this.gotoState("Sdown");
        };
        CEFButton.prototype.doMouseUp = function (evt) {
            this.gotoState("Sup");
        };
        CEFButton.prototype.showButton = function (fShow) {
            this.visible = fShow;
            if (fShow) {
                if (this.traceMode)
                    CUtil_9.CUtil.trace("testing init state: " + name);
                try {
                    if (CEFRoot_5.CEFRoot.gTutor.cCursor.stateHelper(this)) {
                        if (this.traceMode)
                            CUtil_9.CUtil.trace("setting init state Over");
                        this.doMouseOver(null);
                    }
                }
                catch (Error) {
                    if (this.traceMode)
                        CUtil_9.CUtil.trace("cCursor not yet instantiated");
                }
            }
        };
        CEFButton.prototype.loadXML = function (stringSrc) {
            _super.prototype.loadXML.call(this, stringSrc);
            if (stringSrc.onclick != undefined) {
            }
        };
        CEFButton.prototype.saveXML = function () {
            var propVector;
            return propVector;
        };
        return CEFButton;
    }(CEFObject_4.CEFObject));
    exports.CEFButton = CEFButton;
});
define("navigation/CEFNavNext", ["require", "exports", "core/CEFButton"], function (require, exports, CEFButton_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFNavNext = (function (_super) {
        __extends(CEFNavNext, _super);
        function CEFNavNext() {
            return _super.call(this) || this;
        }
        return CEFNavNext;
    }(CEFButton_1.CEFButton));
    exports.CEFNavNext = CEFNavNext;
});
define("navigation/CEFZNavBack", ["require", "exports", "core/CEFButton"], function (require, exports, CEFButton_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFNavBack = (function (_super) {
        __extends(CEFNavBack, _super);
        function CEFNavBack() {
            return _super.call(this) || this;
        }
        return CEFNavBack;
    }(CEFButton_2.CEFButton));
    exports.CEFNavBack = CEFNavBack;
});
define("events/CEFTimerEvent", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Event = createjs.Event;
    var CEFTimerEvent = (function (_super) {
        __extends(CEFTimerEvent, _super);
        function CEFTimerEvent(type, bubbles, cancelable) {
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            return _super.call(this, type, bubbles, cancelable) || this;
        }
        CEFTimerEvent.TIMER_COMPLETE = "complete";
        return CEFTimerEvent;
    }(Event));
    exports.CEFTimerEvent = CEFTimerEvent;
});
define("core/CEFTimer", ["require", "exports", "core/CEFRoot", "events/CEFTimerEvent", "util/CUtil"], function (require, exports, CEFRoot_6, CEFTimerEvent_1, CUtil_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var EventDispatcher = createjs.EventDispatcher;
    var CEFTimer = (function (_super) {
        __extends(CEFTimer, _super);
        function CEFTimer(delay, repeatCount) {
            if (repeatCount === void 0) { repeatCount = 0; }
            var _this = _super.call(this) || this;
            _this.traceMode = false;
            _this._delay = delay;
            _this._repeatCount = repeatCount;
            return _this;
        }
        CEFTimer.prototype.cancelTimers = function (evt) {
            if (this.traceMode)
                CUtil_10.CUtil.trace(" cancelTimers : " + CEFTimer.activeTimers.length);
            var tCount = CEFTimer.activeTimers.length;
            for (var i1 = 0; i1 < tCount; i1++) {
                CEFTimer.activeTimers[0].stop();
                CEFTimer.activeTimers.pop();
            }
        };
        CEFTimer.prototype.pauseTimers = function (evt) {
            if (this.traceMode)
                CUtil_10.CUtil.trace(" pauseTimers : " + CEFTimer.activeTimers.length);
            for (var i1 = 0; i1 < CEFTimer.activeTimers.length; i1++) {
                CEFTimer.activeTimers[i1].stop();
            }
        };
        CEFTimer.prototype.playTimers = function (evt) {
            if (this.traceMode)
                CUtil_10.CUtil.trace(" playTimers : " + CEFTimer.activeTimers.length);
            for (var i1 = 0; i1 < CEFTimer.activeTimers.length; i1++) {
                CEFTimer.activeTimers[i1].start();
            }
        };
        CEFTimer.prototype.timerRemoveThis = function () {
            if (this.traceMode)
                CUtil_10.CUtil.trace(" timerRemoveThis : ");
            for (var i1 = 0; i1 < CEFTimer.activeTimers.length; i1++) {
                if (CEFTimer.activeTimers[i1] == this) {
                    CEFTimer.activeTimers.splice(i1, 1);
                    break;
                }
            }
        };
        CEFTimer.prototype.timerAddThis = function () {
            if (this.traceMode)
                CUtil_10.CUtil.trace(" timerAddThis : ");
            var fAdd = true;
            for (var i1 = 0; i1 < CEFTimer.activeTimers.length; i1++) {
                if (CEFTimer.activeTimers[i1] == this) {
                    fAdd = false;
                    break;
                }
            }
            if (fAdd)
                CEFTimer.activeTimers.push(this);
        };
        CEFTimer.prototype.reset = function () {
            if (this.traceMode)
                CUtil_10.CUtil.trace(" is resetting");
            this.timerRemoveThis();
        };
        CEFTimer.prototype.start = function () {
            if (this.traceMode)
                CUtil_10.CUtil.trace(" Timer is starting");
            if (CEFRoot_6.CEFRoot.gTutor) {
                CEFRoot_6.CEFRoot.gTutor.addEventListener(CEFRoot_6.CEFRoot.WOZCANCEL, this.cancelTimers);
                CEFRoot_6.CEFRoot.gTutor.addEventListener(CEFRoot_6.CEFRoot.WOZPAUSING, this.pauseTimers);
                CEFRoot_6.CEFRoot.gTutor.addEventListener(CEFRoot_6.CEFRoot.WOZPLAYING, this.playTimers);
                this.timerAddThis();
                this.addEventListener(CEFTimerEvent_1.CEFTimerEvent.TIMER_COMPLETE, this.timerFinished);
            }
        };
        CEFTimer.prototype.timerFinished = function (evt) {
            this.timerRemoveThis();
            this.removeEventListener(CEFTimerEvent_1.CEFTimerEvent.TIMER_COMPLETE, this.timerFinished);
        };
        CEFTimer.prototype.stop = function () {
            if (this.traceMode)
                CUtil_10.CUtil.trace(" Timer is stopping");
            if (CEFRoot_6.CEFRoot.gTutor) {
                CEFRoot_6.CEFRoot.gTutor.removeEventListener(CEFRoot_6.CEFRoot.WOZCANCEL, this.cancelTimers);
                CEFRoot_6.CEFRoot.gTutor.removeEventListener(CEFRoot_6.CEFRoot.WOZPAUSING, this.pauseTimers);
                CEFRoot_6.CEFRoot.gTutor.removeEventListener(CEFRoot_6.CEFRoot.WOZPLAYING, this.playTimers);
                this.timerRemoveThis();
                this.removeEventListener(CEFTimerEvent_1.CEFTimerEvent.TIMER_COMPLETE, this.timerFinished);
            }
        };
        CEFTimer.activeTimers = new Array();
        return CEFTimer;
    }(EventDispatcher));
    exports.CEFTimer = CEFTimer;
});
define("events/CEFNavEvent", ["require", "exports", "util/CUtil"], function (require, exports, CUtil_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Event = createjs.Event;
    var CEFNavEvent = (function (_super) {
        __extends(CEFNavEvent, _super);
        function CEFNavEvent(type, _target, _featureSet, bubbles, cancelable) {
            if (_target === void 0) { _target = null; }
            if (_featureSet === void 0) { _featureSet = null; }
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            var _this = _super.call(this, type, bubbles, cancelable) || this;
            _this.wozNavTarget = _target;
            _this.wozFeatures = _featureSet;
            return _this;
        }
        CEFNavEvent.prototype.clone = function () {
            CUtil_11.CUtil.trace("cloning WOZEvent:");
            return new CEFNavEvent(this.type, this.wozNavTarget, this.wozFeatures, this.bubbles, this.cancelable);
        };
        CEFNavEvent.WOZNAVNEXT = "WOZNAVNEXT";
        CEFNavEvent.WOZNAVBACK = "WOZNAVBACK";
        CEFNavEvent.WOZNAVTO = "WOZNAVTO";
        CEFNavEvent.WOZNAVINC = "WOZNAVINC";
        CEFNavEvent.WOZNAVREPLAY = "WOZNAVREPLAY";
        return CEFNavEvent;
    }(Event));
    exports.CEFNavEvent = CEFNavEvent;
});
define("scenegraph/CGraphConstraint", ["require", "exports", "core/CEFRoot", "util/CUtil"], function (require, exports, CEFRoot_7, CUtil_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CGraphConstraint = (function (_super) {
        __extends(CGraphConstraint, _super);
        function CGraphConstraint() {
            return _super.call(this) || this;
        }
        CGraphConstraint.factory = function (parent, factory) {
            var node = new CGraphConstraint;
            node._parent = parent;
            node._cmd = factory.cmd;
            node._code = factory.code;
            return node;
        };
        CGraphConstraint.prototype.execute = function () {
            var result = false;
            switch (this._cmd) {
                case "test":
                    result = CEFRoot_7.CEFRoot.gTutor.testFeatureSet(this._code);
                    break;
                case "exec":
                    try {
                        result = eval(this._code);
                    }
                    catch (err) {
                        CUtil_12.CUtil.trace("CSceneGraphNavigator.execute: " + err.toString());
                        result = false;
                    }
                    break;
            }
            return result;
        };
        return CGraphConstraint;
    }(Object));
    exports.CGraphConstraint = CGraphConstraint;
});
define("scenegraph/CGraphEdge", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CGraphEdge = (function (_super) {
        __extends(CGraphEdge, _super);
        function CGraphEdge() {
            return _super.call(this) || this;
        }
        CGraphEdge.factory = function (parent, factory) {
            var edge = new CGraphEdge;
            edge._parent = parent;
            edge._edgeConst = factory.constraint;
            edge._edgeNode = factory.edge;
            if (factory.$P != undefined) {
                edge._pid = factory.pid;
                edge._prob = factory.$P.split('|');
                edge._cycle = Number(factory.cycle);
            }
            return edge;
        };
        CGraphEdge.prototype.testPConstraint = function () {
            var result = true;
            var iter;
            var rand;
            if (this._pid != null) {
                iter = this._parent.queryPConstraint(this._pid, this._prob.length, this._cycle);
                rand = Math.random();
                result = (rand < this._prob[iter]);
            }
            return result;
        };
        CGraphEdge.prototype.testConstraint = function () {
            var result = true;
            var constraint = this._parent.findConstraintByName(this._edgeConst);
            if (constraint != null)
                result = constraint.execute();
            return result;
        };
        CGraphEdge.prototype.followEdge = function () {
            return this._parent.findNodeByName(this._edgeNode);
        };
        return CGraphEdge;
    }(Object));
    exports.CGraphEdge = CGraphEdge;
});
define("scenegraph/CGraphScene", ["require", "exports", "core/CEFRoot"], function (require, exports, CEFRoot_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CGraphScene = (function (_super) {
        __extends(CGraphScene, _super);
        function CGraphScene(factory, parent) {
            var _this = _super.call(this) || this;
            _this._iteration = 0;
            _this._parent = parent;
            _this._name = factory.name;
            _this._title = factory.title;
            _this._page = factory.page;
            _this._class = factory.classname;
            _this._features = factory.features;
            _this._enqueue = (factory.enqueue === "true") ? true : false;
            _this._create = (factory.create === "true") ? true : false;
            _this._visible = (factory.visible === "true") ? true : false;
            _this._persist = (factory.persist === "true") ? true : false;
            _this._checkpnt = (factory.ischeckpnt === "true") ? true : false;
            _this._object = factory.object;
            if (factory.$P != undefined) {
                _this._pid = factory.pid;
                _this._prob = factory.$P.split('|');
                _this._cycle = Number(factory.cycle);
            }
            if (_this._create)
                _this.instantiateScene();
            if (_this._object != "null")
                CEFRoot_8.CEFRoot.gTutor.automateScene(_this._name, CEFRoot_8.CEFRoot.gTutor[_this._object], false);
            return _this;
        }
        CGraphScene.prototype.instantiateScene = function () {
            this._scene = CEFRoot_8.CEFRoot.gTutor.instantiateScene(this._name, this._class, this._visible);
            this.features = this._features;
        };
        CGraphScene.prototype.destroyScene = function () {
            this._scene = null;
        };
        Object.defineProperty(CGraphScene.prototype, "features", {
            get: function () {
                if (this._scene != null)
                    return this._scene.features;
                else
                    return this._features;
            },
            set: function (newFTR) {
                this._scene.features = newFTR;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CGraphScene.prototype, "hasPFeature", {
            get: function () {
                return (this._pid != null);
            },
            enumerable: true,
            configurable: true
        });
        CGraphScene.prototype.testPFeature = function () {
            var iter = this._parent.queryPFeature(this._pid, this._prob.length, this._cycle);
            var rand = Math.random();
            return (rand < this._prob[iter]);
        };
        Object.defineProperty(CGraphScene.prototype, "scenename", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CGraphScene.prototype, "classname", {
            get: function () {
                return this._class;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CGraphScene.prototype, "title", {
            get: function () {
                return this._title;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CGraphScene.prototype, "isCheckPoint", {
            get: function () {
                return this._checkpnt;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CGraphScene.prototype, "page", {
            get: function () {
                return this._page;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CGraphScene.prototype, "persist", {
            get: function () {
                return this._persist;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CGraphScene.prototype, "iteration", {
            get: function () {
                return this._iteration;
            },
            enumerable: true,
            configurable: true
        });
        CGraphScene.prototype.incIteration = function () {
            this._iteration++;
            return this._iteration;
        };
        CGraphScene.prototype.enumDisplayList = function () {
            CEFRoot_8.CEFRoot.gTutor.enumChildren(CEFRoot_8.CEFRoot.gTutor, 0);
        };
        return CGraphScene;
    }(Object));
    exports.CGraphScene = CGraphScene;
});
define("scenegraph/CGraphNode", ["require", "exports", "scenegraph/CGraphEdge"], function (require, exports, CGraphEdge_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var EventDispatcher = createjs.EventDispatcher;
    var CGraphNode = (function (_super) {
        __extends(CGraphNode, _super);
        function CGraphNode() {
            var _this = _super.call(this) || this;
            _this._edges = new Array;
            return _this;
        }
        CGraphNode.prototype.nodeFactory = function (parent, id, nodefactory) {
            this._parent = parent;
            this._id = id;
            this._type = nodefactory.type;
            this._name = nodefactory.name;
            this._preEnter = nodefactory.preenter;
            this._preExit = nodefactory.preexit;
            if (this._preEnter == "")
                this._preEnter = null;
            if (this._preExit == "")
                this._preExit = null;
            for (var _i = 0, _a = nodefactory.edges; _i < _a.length; _i++) {
                var edge = _a[_i];
                this._edges.push(CGraphEdge_1.CGraphEdge.factory(parent, edge));
            }
        };
        Object.defineProperty(CGraphNode.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        CGraphNode.prototype.captureGraph = function (obj) {
            return obj;
        };
        CGraphNode.prototype.restoreGraph = function (obj) {
        };
        CGraphNode.prototype.nextScene = function () {
            return null;
        };
        CGraphNode.prototype.nextNode = function () {
            var edge;
            var node = this;
            if (this._preExit != null) {
            }
            for (var _i = 0, _a = this._edges; _i < _a.length; _i++) {
                var edge_1 = _a[_i];
                if (edge_1.testConstraint() && edge_1.testPConstraint()) {
                    node = edge_1.followEdge();
                    if (node != null && node._preEnter != null) {
                        eval(node._preEnter);
                    }
                    break;
                }
            }
            if (this._edges.length == 0)
                node = null;
            return node;
        };
        CGraphNode.prototype.applyNode = function () {
            return false;
        };
        CGraphNode.prototype.seekToScene = function (seekScene) {
            return null;
        };
        CGraphNode.prototype.seekToSceneByName = function (seekScene) {
            return null;
        };
        CGraphNode.prototype.resetNode = function () {
        };
        return CGraphNode;
    }(EventDispatcher));
    exports.CGraphNode = CGraphNode;
});
define("bkt/CBKTSkill", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CBKTSkill = (function () {
        function CBKTSkill() {
        }
        CBKTSkill.factory = function (factory) {
            var node = new CBKTSkill;
            node.Bel = 0;
            node.pL = factory.pL;
            node.pT = factory.pT;
            node.pG = factory.pG;
            node.pS = factory.pS;
            return node;
        };
        CBKTSkill.prototype.updateBelief = function (ans) {
            if (ans == true)
                this.Bel = this.calcTRUE();
            else
                this.Bel = this.calcFALSE();
            this.pL = this.updatePrior(this.Bel);
        };
        CBKTSkill.prototype.calcTRUE = function () {
            return (this.pL * (1 - this.pS)) / ((this.pL * (1 - this.pS)) + ((1 - this.pL) * this.pG));
        };
        CBKTSkill.prototype.calcFALSE = function () {
            return (this.pL * this.pS) / ((this.pL * this.pS) + ((1 - this.pL) * (1 - this.pG)));
        };
        CBKTSkill.prototype.updatePrior = function (Bel) {
            return Bel + ((1 - Bel) * this.pT);
        };
        CBKTSkill.prototype.queryBelief = function () {
            return this.Bel;
        };
        return CBKTSkill;
    }());
    exports.CBKTSkill = CBKTSkill;
});
define("scenegraph/CGraphAction", ["require", "exports", "scenegraph/CGraphNode"], function (require, exports, CGraphNode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CGraphAction = (function (_super) {
        __extends(CGraphAction, _super);
        function CGraphAction() {
            return _super.call(this) || this;
        }
        CGraphAction.factory = function (parent, id, factory) {
            var nodeFactoryData = factory.CNodes[id];
            var node = new CGraphAction;
            node.nodeFactory(parent, id, nodeFactoryData);
            var actObject = factory.CActions[nodeFactoryData.name];
            node._cmnd = actObject.cmd;
            node._parms = actObject.parms;
            return node;
        };
        CGraphAction.prototype.captureGraph = function (obj) {
            return obj;
        };
        CGraphAction.prototype.restoreGraph = function (obj) {
        };
        CGraphAction.prototype.nextScene = function () {
            return null;
        };
        CGraphAction.prototype.applyNode = function () {
            return false;
        };
        return CGraphAction;
    }(CGraphNode_1.CGraphNode));
    exports.CGraphAction = CGraphAction;
});
define("scenegraph/CGraphModule", ["require", "exports", "scenegraph/CGraphNode", "scenegraph/CGraphScene", "core/CEFRoot", "util/CUtil"], function (require, exports, CGraphNode_2, CGraphScene_1, CEFRoot_9, CUtil_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CGraphModule = (function (_super) {
        __extends(CGraphModule, _super);
        function CGraphModule() {
            var _this = _super.call(this) || this;
            _this._scenes = new Array;
            _this._ndx = -1;
            return _this;
        }
        CGraphModule.factory = function (parent, id, moduleFactory, factory) {
            var moduleFactoryData = factory.CModules[moduleFactory.name];
            var node = new CGraphModule;
            if (moduleFactory.edges)
                node.nodeFactory(parent, id, moduleFactory);
            node._reuse = moduleFactoryData.reuse;
            var sceneList = moduleFactoryData.scenes;
            for (var _i = 0, sceneList_1 = sceneList; _i < sceneList_1.length; _i++) {
                var scene = sceneList_1[_i];
                node._scenes.push(new CGraphScene_1.CGraphScene(scene, parent));
            }
            return node;
        };
        CGraphModule.prototype.captureGraph = function (obj) {
            obj['index'] = this._ndx.toString();
            return obj;
        };
        CGraphModule.prototype.restoreGraph = function (obj) {
            this._ndx = Number(obj['index']);
            return this._scenes[this._ndx];
        };
        CGraphModule.prototype.nextScene = function () {
            var nextScene = null;
            var features;
            while (this._ndx < this._scenes.length) {
                this._ndx++;
                if (this._ndx >= this._scenes.length)
                    nextScene = null;
                else
                    nextScene = this._scenes[this._ndx];
                if (nextScene != null) {
                    features = nextScene.features;
                    if (features != "") {
                        if (CEFRoot_9.CEFRoot.gTutor.testFeatureSet(features)) {
                            if (nextScene.hasPFeature) {
                                if (nextScene.testPFeature())
                                    break;
                            }
                            else
                                break;
                        }
                        CUtil_13.CUtil.trace("Graph Feature: " + features + " :failed.");
                    }
                    else if (nextScene.hasPFeature) {
                        if (nextScene.testPFeature())
                            break;
                    }
                    else
                        break;
                }
                else
                    break;
            }
            if (this._ndx >= this._scenes.length) {
                if (this._reuse) {
                    this.resetNode();
                }
            }
            return nextScene;
        };
        CGraphModule.prototype.applyNode = function () {
            dispatchEvent(new Event("todo"));
            return false;
        };
        CGraphModule.prototype.seekToScene = function (seekScene) {
            var scene = null;
            var ndx = 0;
            for (var _i = 0, _a = this._scenes; _i < _a.length; _i++) {
                scene = _a[_i];
                if (seekScene == scene) {
                    this._ndx = ndx;
                    break;
                }
                ndx++;
            }
            return scene;
        };
        CGraphModule.prototype.resetNode = function () {
            this._ndx = -1;
        };
        return CGraphModule;
    }(CGraphNode_2.CGraphNode));
    exports.CGraphModule = CGraphModule;
});
define("scenegraph/CGraphModuleGroup", ["require", "exports", "scenegraph/CGraphNode", "scenegraph/CGraphModule"], function (require, exports, CGraphNode_3, CGraphModule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CGraphModuleGroup = (function (_super) {
        __extends(CGraphModuleGroup, _super);
        function CGraphModuleGroup() {
            var _this = _super.call(this) || this;
            _this._modules = new Array;
            _this._ndx = -1;
            _this._moduleShown = false;
            _this._shownCount = 0;
            return _this;
        }
        CGraphModuleGroup.factory = function (parent, id, groupFactory, factory) {
            var groupFactoryData = factory.CModuleGroups[groupFactory.name];
            var node = new CGraphModuleGroup;
            if (groupFactory.edges)
                node.nodeFactory(parent, id, groupFactory);
            node.instanceNode = groupFactoryData.instanceNode;
            node.type = groupFactoryData.type;
            node.start = groupFactoryData.start;
            node.show = groupFactoryData.show;
            node.reuse = groupFactoryData.reuse;
            node.onempty = groupFactoryData.onempty;
            var moduleList = groupFactoryData.modules;
            for (var _i = 0, moduleList_1 = moduleList; _i < moduleList_1.length; _i++) {
                var moduleDescr = moduleList_1[_i];
                if (moduleDescr.instanceNode != "") {
                    node._modules.push(parent.findNodeByName(moduleDescr.instanceNode));
                }
                else {
                    node._modules.push(CGraphModule_1.CGraphModule.factory(parent, "", moduleDescr, factory));
                }
            }
            return node;
        };
        CGraphModuleGroup.prototype.captureGraph = function (obj) {
            obj['index'] = this._ndx.toString();
            obj['_moduleShown'] = this._moduleShown.toString();
            obj['_shownCount'] = this._shownCount.toString();
            obj['moduleNode'] = this._modules[this._ndx].captureGraph(new Object);
            return obj;
        };
        CGraphModuleGroup.prototype.restoreGraph = function (obj) {
            this._ndx = Number(obj['index']);
            this._moduleShown = (obj['_moduleShown'] == 'true') ? true : false;
            this._shownCount = Number(obj['_shownCount']);
            return this._modules[this._ndx].restoreGraph(obj['moduleNode']);
        };
        CGraphModuleGroup.prototype.initialize = function () {
            switch (this.type) {
                case CGraphModuleGroup.SEQUENTIAL:
                    switch (this.start) {
                        case CGraphModuleGroup.STOCHASTIC:
                            break;
                        default:
                            this._ndx = Number(this.start);
                            break;
                    }
                    break;
            }
        };
        CGraphModuleGroup.prototype.nextScene = function () {
            var nextScene = null;
            if (this._ndx == -1)
                this.initialize();
            do {
                nextScene = this._modules[this._ndx].nextScene();
                if (nextScene == null) {
                    this._ndx++;
                    this._ndx = this._ndx % this._modules.length;
                    if (this.show != "all") {
                        if (this._moduleShown)
                            this._shownCount++;
                        if (this._shownCount == Number(this.show)) {
                            this._moduleShown = false;
                            this._shownCount = 0;
                            break;
                        }
                    }
                }
                else
                    break;
            } while (this._ndx < this._modules.length);
            if (nextScene != null)
                this._moduleShown = true;
            return nextScene;
        };
        CGraphModuleGroup.prototype.applyNode = function () {
            dispatchEvent(new Event("todo"));
            return false;
        };
        CGraphModuleGroup.prototype.seekToScene = function (seekScene) {
            var module;
            var scene = null;
            var ndx = 0;
            for (var _i = 0, _a = this._modules; _i < _a.length; _i++) {
                var module_1 = _a[_i];
                if (seekScene == module_1.seekToScene(seekScene)) {
                    this._ndx = ndx;
                    break;
                }
                ndx++;
            }
            return scene;
        };
        CGraphModuleGroup.prototype.resetNode = function () {
            this._ndx = -1;
            this._shownCount = 0;
            this._moduleShown = false;
        };
        CGraphModuleGroup.SEQUENTIAL = "seqtype";
        CGraphModuleGroup.STOCHASTIC = "randtype";
        return CGraphModuleGroup;
    }(CGraphNode_3.CGraphNode));
    exports.CGraphModuleGroup = CGraphModuleGroup;
});
define("scenegraph/CSceneGraph", ["require", "exports", "scenegraph/CGraphNode", "core/CEFNavigator", "scenegraph/CGraphConstraint", "core/CEFRoot", "bkt/CBKTSkill", "scenegraph/CGraphAction", "scenegraph/CGraphModule", "scenegraph/CGraphModuleGroup", "util/CUtil"], function (require, exports, CGraphNode_4, CEFNavigator_1, CGraphConstraint_1, CEFRoot_10, CBKTSkill_1, CGraphAction_1, CGraphModule_2, CGraphModuleGroup_1, CUtil_14) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CSceneGraph = (function (_super) {
        __extends(CSceneGraph, _super);
        function CSceneGraph() {
            var _this = _super.call(this) || this;
            _this._nodes = new Object;
            _this._modules = new Object;
            _this._actions = new Object;
            _this._graphs = new Object;
            _this._constraints = new Object;
            _this._skillSet = new Object;
            return _this;
        }
        CSceneGraph.factory = function (parent, id, factory) {
            var scenegraph = new CSceneGraph;
            scenegraph.parseNodes(factory);
            scenegraph.parseConstraints(factory['CConstraints']);
            scenegraph.parseSkills(factory['CSkills']);
            return scenegraph;
        };
        CSceneGraph.prototype.captureGraph = function (obj) {
            obj['currNodeID'] = this._currNode.id;
            obj['currNode'] = this._currNode.captureGraph(new Object);
            return obj;
        };
        CSceneGraph.prototype.restoreGraph = function (obj) {
            this._currNode = this.findNodeByName(obj['currNodeID']);
            this._currScene = this._currNode.restoreGraph(obj['currNode']);
            this._prevScene = this._currScene;
            return this._currScene;
        };
        CSceneGraph.prototype.sceneInstance = function () {
            var objInstance = null;
            try {
                if (this._prevScene != null) {
                    objInstance = CEFNavigator_1.CEFNavigator.TutAutomator[this._prevScene.scenename].instance;
                }
            }
            catch (err) {
                CUtil_14.CUtil.trace("CSceneGraphNavigator.sceneInstance: " + err.toString());
                objInstance = null;
            }
            return objInstance;
        };
        CSceneGraph.prototype.queryPFeature = function (pid, size, cycle) {
            var iter = 0;
            if (CSceneGraph._pFeatures[pid] != undefined) {
                iter = CSceneGraph._pFeatures[pid] + 1;
                if (iter >= size) {
                    iter = size - cycle;
                }
                CSceneGraph._pFeatures[pid] = iter;
            }
            else
                CSceneGraph._pFeatures[pid] = 0;
            return iter;
        };
        CSceneGraph.prototype.queryPConstraint = function (pid, size, cycle) {
            var iter = 0;
            if (CSceneGraph._pConstraints[pid] != undefined) {
                iter = CSceneGraph._pConstraints[pid] + 1;
                if (iter >= size) {
                    iter = size - cycle;
                }
                CSceneGraph._pConstraints[pid] = iter;
            }
            else
                CSceneGraph._pConstraints[pid] = 0;
            return iter;
        };
        CSceneGraph.prototype.seekTo = function (nxtScene) {
            return null;
        };
        CSceneGraph.prototype.seekEnd = function () {
            return null;
        };
        CSceneGraph.prototype.applyNode = function () {
            return this._currNode.applyNode();
        };
        CSceneGraph.prototype.seekBack = function () {
            return null;
        };
        CSceneGraph.prototype.seekRoot = function () {
            this._currNode = this._nodes["root"];
        };
        CSceneGraph.prototype.nextScene = function () {
            var nextNode;
            if (this._currNode)
                do {
                    this._currScene = this._currNode.nextScene();
                    if (this._currScene == null) {
                        nextNode = this._currNode.nextNode();
                        if (this._currNode == nextNode) {
                            this._currScene = this._prevScene;
                            this._currNode.seekToScene(this._currScene);
                        }
                        else {
                            this._currNode = nextNode;
                            if (this._currNode != null)
                                this._currNode.applyNode();
                        }
                    }
                    else
                        this._currScene.incIteration();
                } while ((this._currScene == null) && (this._currNode != null));
            this._prevScene = this._currScene;
            return this._currScene;
        };
        CSceneGraph.prototype.parseNodes = function (_factory) {
            var nodeList = _factory.CNodes;
            for (var name_1 in nodeList) {
                if (name_1 != "COMMENT")
                    switch (nodeList[name_1].type) {
                        case "action":
                            this._nodes[name_1] = CGraphAction_1.CGraphAction.factory(this, name_1, _factory);
                            break;
                        case "module":
                            this._nodes[name_1] = CGraphModule_2.CGraphModule.factory(this, name_1, nodeList[name_1], _factory);
                            break;
                        case "modulegroup":
                            this._nodes[name_1] = CGraphModuleGroup_1.CGraphModuleGroup.factory(this, name_1, nodeList[name_1], _factory);
                            break;
                        case "subgraph":
                            break;
                        case "external":
                            break;
                    }
            }
            return true;
        };
        CSceneGraph.prototype.parseConstraints = function (constFactory) {
            for (var name_2 in constFactory) {
                if (name_2 != "COMMENT")
                    this._constraints[name_2] = CGraphConstraint_1.CGraphConstraint.factory(this, constFactory[name_2]);
            }
            return true;
        };
        CSceneGraph.prototype.parseSkills = function (skillsFactory) {
            for (var name_3 in skillsFactory) {
                if (name_3 != "COMMENT")
                    this._skillSet[name_3] = CBKTSkill_1.CBKTSkill.factory(skillsFactory[name_3]);
            }
            CEFRoot_10.CEFRoot.gTutor.ktSkills = this._skillSet;
            return true;
        };
        CSceneGraph.prototype.findNodeByName = function (name) {
            return this._nodes[name];
        };
        CSceneGraph.prototype.findConstraintByName = function (name) {
            return this._constraints[name];
        };
        Object.defineProperty(CSceneGraph.prototype, "node", {
            get: function () {
                return this._currNode;
            },
            set: function (newNode) {
                if (this._currNode != newNode)
                    this._currNode.resetNode();
                this._currNode = newNode;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CSceneGraph.prototype, "scene", {
            set: function (seekScene) {
                this._currNode.seekToScene(seekScene);
            },
            enumerable: true,
            configurable: true
        });
        CSceneGraph._pFeatures = new Object;
        CSceneGraph._pConstraints = new Object;
        return CSceneGraph;
    }(CGraphNode_4.CGraphNode));
    exports.CSceneGraph = CSceneGraph;
});
define("scenegraph/CGraphHistoryNode", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CGraphHistoryNode = (function (_super) {
        __extends(CGraphHistoryNode, _super);
        function CGraphHistoryNode(_node, _scene) {
            var _this = _super.call(this) || this;
            _this.node = _node;
            _this.scene = _scene;
            return _this;
        }
        return CGraphHistoryNode;
    }(Object));
    exports.CGraphHistoryNode = CGraphHistoryNode;
});
define("scenegraph/CGraphHistory", ["require", "exports", "scenegraph/CGraphHistoryNode"], function (require, exports, CGraphHistoryNode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CGraphHistory = (function (_super) {
        __extends(CGraphHistory, _super);
        function CGraphHistory() {
            var _this = _super.call(this) || this;
            _this._history = new Array();
            _this._volatile = false;
            _this._ndx = 0;
            return _this;
        }
        CGraphHistory.prototype.push = function (node, scene) {
            if (scene != null) {
                this._history.push(new CGraphHistoryNode_1.CGraphHistoryNode(node, scene));
                this._ndx = this._history.length;
            }
        };
        CGraphHistory.prototype.next = function () {
            var next = null;
            if (this._ndx < this._history.length) {
                this._ndx = this._ndx + 1;
                next = this._history[this._ndx - 1];
            }
            return next;
        };
        CGraphHistory.prototype.back = function () {
            var prev = null;
            if (this._ndx > 1) {
                this._ndx = this._ndx - 1;
                if (this._volatile)
                    this._history.pop();
                prev = this._history[this._ndx - 1];
            }
            return prev;
        };
        Object.defineProperty(CGraphHistory.prototype, "volatile", {
            set: function (newState) {
                this._volatile = newState;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CGraphHistory.prototype, "isVolatile", {
            get: function () {
                return this._volatile;
            },
            enumerable: true,
            configurable: true
        });
        return CGraphHistory;
    }(Object));
    exports.CGraphHistory = CGraphHistory;
});
define("scenegraph/CSceneGraphNavigator", ["require", "exports", "scenegraph/CSceneGraph", "scenegraph/CGraphHistory", "core/CEFNavigator", "core/CEFRoot", "events/CEFEvent", "util/CUtil", "mongo/MObject", "mongo/CMongo", "core/CEFDoc"], function (require, exports, CSceneGraph_1, CGraphHistory_1, CEFNavigator_2, CEFRoot_11, CEFEvent_5, CUtil_15, MObject_3, CMongo_2, CEFDoc_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CSceneGraphNavigator = (function (_super) {
        __extends(CSceneGraphNavigator, _super);
        function CSceneGraphNavigator() {
            var _this = _super.call(this) || this;
            _this._iterations = new Object;
            return _this;
        }
        Object.defineProperty(CSceneGraphNavigator.prototype, "sceneObj", {
            get: function () {
                return CSceneGraphNavigator._rootGraph.sceneInstance();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CSceneGraphNavigator.prototype, "iteration", {
            get: function () {
                var iCount;
                try {
                    iCount = this._iterations[this._currScene.scenename].toString();
                }
                catch (err) {
                    iCount = "uninitialized";
                }
                return iCount;
            },
            enumerable: true,
            configurable: true
        });
        CSceneGraphNavigator.prototype.updateSceneIteration = function () {
            if (this._iterations[this._currScene.scenename] == undefined) {
                this._iterations[this._currScene.scenename] = 1;
            }
            else {
                if (!CEFRoot_11.CEFRoot.gTutor.testFeatureSet("NO_ITER"))
                    this._iterations[this._currScene.scenename]++;
            }
        };
        CSceneGraphNavigator.rootGraphFactory = function (factory) {
            var scene;
            this._history = new CGraphHistory_1.CGraphHistory();
            if (factory['history'] != null) {
                this._history.volatile = (factory['history'] == "volatile") ? true : false;
            }
            CSceneGraphNavigator._rootGraph = CSceneGraph_1.CSceneGraph.factory(null, "root", factory);
            CSceneGraphNavigator._rootGraph.seekRoot();
        };
        CSceneGraphNavigator.prototype.enQueueTerminateEvent = function () {
            addEventListener(CEFEvent_5.CEFEvent.ENTER_FRAME, this._deferredTerminate);
        };
        CSceneGraphNavigator.prototype._deferredTerminate = function (e) {
            removeEventListener(CEFEvent_5.CEFEvent.ENTER_FRAME, this._deferredTerminate);
            this.gLogR.logTerminateEvent();
        };
        Object.defineProperty(CSceneGraphNavigator, "buttonBehavior", {
            set: function (action) {
                if (action == CSceneGraphNavigator.GOTONEXTSCENE)
                    this._fSceneGraph = true;
                else
                    this._fSceneGraph = false;
            },
            enumerable: true,
            configurable: true
        });
        CSceneGraphNavigator.prototype.onButtonNext = function (evt) {
            dispatchEvent(new Event("NEXT_CLICK"));
            this.traceGraphEdge();
        };
        CSceneGraphNavigator.prototype.recoverState = function () {
            this._xType = "WOZNEXT";
            CSceneGraphNavigator._rootGraph.parseSkills(CEFRoot_11.CEFRoot.sessionAccount.session.profile.stateData.ktSkills);
            this.globals = CEFRoot_11.CEFRoot.sessionAccount.session.profile.stateData.globals;
            CEFRoot_11.CEFRoot.gTutor.features = CEFRoot_11.CEFRoot.sessionAccount.session.profile.stateData.features;
            this._phaseData = CEFRoot_11.CEFRoot.sessionAccount.session.profile.stateData.data;
            this.seekToScene(CSceneGraphNavigator._rootGraph.restoreGraph(CEFRoot_11.CEFRoot.sessionAccount.session.profile.stateData.sceneGraph));
        };
        CSceneGraphNavigator.prototype.gotoNextScene = function () {
            addEventListener(CEFEvent_5.CEFEvent.ENTER_FRAME, this._deferredNextScene);
        };
        CSceneGraphNavigator.prototype._deferredNextScene = function (e) {
            removeEventListener(CEFEvent_5.CEFEvent.ENTER_FRAME, this._deferredNextScene);
            this.traceGraphEdge();
        };
        CSceneGraphNavigator.prototype.traceGraphEdge = function () {
            var historyNode;
            var nextScene;
            var scene = CSceneGraphNavigator._rootGraph.sceneInstance();
            try {
                if (this._inNavigation)
                    return;
                this._inNavigation = true;
                if (CSceneGraphNavigator._fSceneGraph || scene == null || scene.nextGraphAnimation(true) == null) {
                    historyNode = CSceneGraphNavigator._history.next();
                    if (historyNode == null) {
                        nextScene = CSceneGraphNavigator._rootGraph.nextScene();
                        if (this._currScene != nextScene && nextScene != null) {
                            CSceneGraphNavigator._history.push(CSceneGraphNavigator._rootGraph.node, nextScene);
                        }
                        else if (nextScene == null)
                            this.enQueueTerminateEvent();
                    }
                    else {
                        nextScene = historyNode.scene;
                    }
                    this._xType = "WOZNEXT";
                    if (this._currScene != nextScene && nextScene != null) {
                        this.seekToScene(nextScene);
                    }
                    else {
                        this._inNavigation = false;
                    }
                }
                else {
                    this._inNavigation = false;
                }
            }
            catch (err) {
                CUtil_15.CUtil.trace("CSceneGraphNavigator.traceGraphEdge: " + err.toString());
                var logData = { 'location': 'traceGraphEdge', 'message': err.toString() };
                this.gLogR.logErrorEvent(logData);
            }
        };
        CSceneGraphNavigator.prototype.onButtonPrev = function (evt) {
            var historyNode;
            try {
                if (this._inNavigation)
                    return;
                this._inNavigation = true;
                do {
                    historyNode = CSceneGraphNavigator._history.back();
                    if (historyNode != null) {
                        this.features = historyNode.scene.features;
                        if (this.features != "") {
                            if (!CEFRoot_11.CEFRoot.gTutor.testFeatureSet(this.features)) {
                                continue;
                            }
                        }
                        if (CSceneGraphNavigator._history.isVolatile) {
                            CSceneGraphNavigator._rootGraph.node = historyNode.node;
                            CSceneGraphNavigator._rootGraph.scene = historyNode.scene;
                        }
                        this._xType = "WOZBACK";
                        this.seekToScene(historyNode.scene);
                        break;
                    }
                    else {
                        this._inNavigation = false;
                    }
                } while (historyNode != null);
            }
            catch (err) {
                CUtil_15.CUtil.trace("CSceneGraphNavigator.onButtonPrev: " + err.toString());
                var logData = { 'location': 'onButtonPrev', 'message': err.toString() };
                this.gLogR.logErrorEvent(logData);
            }
        };
        CSceneGraphNavigator.prototype.seekToScene = function (nextScene) {
            var _progressData;
            try {
                this._nextScene = nextScene;
                var logData = void 0;
                if (CEFRoot_11.CEFRoot.fDemo)
                    CEFRoot_11.CEFRoot.fDeferDemoClick = true;
                this._prevScene = this._currScene;
                if (this._currScene)
                    CSceneGraphNavigator.TutAutomator[this._currScene.scenename].instance.preExitScene(this._xType, 0);
                if (CSceneGraphNavigator.TutAutomator[this._nextScene.scenename] == undefined) {
                    this._nextScene.instantiateScene();
                }
                CSceneGraphNavigator.TutAutomator[this._nextScene.scenename].instance.preEnterScene(CSceneGraphNavigator.prntTutor, this._nextScene.scenename, this._nextScene.title, this._nextScene.page, this._xType);
                if (this._currScene)
                    logData = { 'curscene': this._currScene.scenename, 'newscene': this._nextScene.scenename };
                else
                    logData = { 'curscene': 'null', 'newscene': this._nextScene.scenename };
                this.gLogR.logNavEvent(logData);
                if (this._currScene) {
                    CSceneGraphNavigator.TutAutomator[this._currScene.scenename].instance.onExitScene();
                    CSceneGraphNavigator.TutAutomator[this._currScene.scenename].instance.doExitAction();
                }
                if (this._nextScene.isCheckPoint) {
                    if (_progressData == null) {
                        _progressData = new Object;
                        this._profileData = new Object;
                        _progressData['reify'] = new Object;
                        _progressData['reify']['phases'] = new Object;
                        _progressData['reify']['phases'][CEFRoot_11.CEFRoot.sessionAccount.session.profile_Index] = this._profileData;
                        this._profileData['stateData'] = new MObject_3.MObject;
                    }
                    this._profileData.progress = CMongo_2.CMongo._INPROGRESS;
                    this._profileData['stateData']['sceneGraph'] = CSceneGraphNavigator._rootGraph.captureGraph(new Object);
                    this._profileData['stateData']['ktSkills'] = CEFRoot_11.CEFRoot.gTutor.ktSkills;
                    this._profileData['stateData']['globals'] = this.globals;
                    this._profileData['stateData']['features'] = CEFRoot_11.CEFRoot.gTutor.features;
                    this._profileData['stateData']['data'] = this._phaseData;
                    this.gLogR.logProgressEvent(_progressData);
                }
                if (!this.gLogR.connectionActive) {
                    CEFDoc_2.CEFDoc.gApp.dispatchEvent(new Event("CONNECTION_LOST"));
                }
                this._currScene = this._nextScene;
                this.updateSceneIteration();
                CSceneGraphNavigator.prntTutor.xitions.addEventListener(CEFEvent_5.CEFEvent.COMPLETE, this.doEnterScene);
                CSceneGraphNavigator.prntTutor.xitions.gotoScene(this._nextScene.scenename);
            }
            catch (err) {
                CUtil_15.CUtil.trace("CSceneGraphNavigator.seekToScene: " + err.toString());
                var logData = { 'location': 'seekToScene', 'message': err.toString() };
                this.gLogR.logErrorEvent(logData);
            }
        };
        CSceneGraphNavigator.prototype.doEnterScene = function (evt) {
            try {
                if (this.traceMode)
                    CUtil_15.CUtil.trace("doEnterScene: ", this.sceneCurr);
                CSceneGraphNavigator.prntTutor.xitions.removeEventListener(CEFEvent_5.CEFEvent.COMPLETE, this.doEnterScene);
                this.incFrameNdx();
                if (this._prevScene && !this._prevScene.persist) {
                    CSceneGraphNavigator.prntTutor.destroyScene(this._prevScene.scenename);
                    this._prevScene.destroyScene();
                }
                CSceneGraphNavigator.TutAutomator[this._currScene.scenename].instance.onEnterScene(this._xType);
                CSceneGraphNavigator.TutAutomator[this._currScene.scenename].instance.deferredEnterScene(this._xType);
                if (CEFRoot_11.CEFRoot.fDemo)
                    CSceneGraphNavigator.prntTutor.dispatchEvent(new Event("deferedDemoCheck"));
                this._inNavigation = false;
            }
            catch (err) {
                CUtil_15.CUtil.trace("CSceneGraphNavigator.doEnterScene: " + err.toString());
                var logData = { 'location': 'doEnterScene', 'message': err.toString() };
                this.gLogR.logErrorEvent(logData);
            }
        };
        CSceneGraphNavigator._fSceneGraph = true;
        CSceneGraphNavigator.GOTONEXTSCENE = "incSceneGraph";
        CSceneGraphNavigator.GOTONEXTANIMATION = "incAnimationGraph";
        return CSceneGraphNavigator;
    }(CEFNavigator_2.CEFNavigator));
    exports.CSceneGraphNavigator = CSceneGraphNavigator;
});
define("events/CEFSceneCueEvent", ["require", "exports", "util/CUtil"], function (require, exports, CUtil_16) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Event = createjs.Event;
    var CEFSceneCueEvent = (function (_super) {
        __extends(CEFSceneCueEvent, _super);
        function CEFSceneCueEvent(type, CueID, bubbles, cancelable) {
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            var _this = _super.call(this, type, bubbles, cancelable) || this;
            _this.cueID = CueID;
            return _this;
        }
        CEFSceneCueEvent.prototype.clone = function () {
            CUtil_16.CUtil.trace("cloning CEFSceneCueEvent:");
            return new CEFSceneCueEvent(this.type, this.cueID, this.bubbles, this.cancelable);
        };
        CEFSceneCueEvent.CUEPOINT = "cuePoint";
        return CEFSceneCueEvent;
    }(Event));
    exports.CEFSceneCueEvent = CEFSceneCueEvent;
});
define("events/CEFCommandEvent", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Event = createjs.Event;
    var CEFCommandEvent = (function (_super) {
        __extends(CEFCommandEvent, _super);
        function CEFCommandEvent(type, _objCmd, bubbles, cancelable) {
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            var _this = _super.call(this, type, bubbles, cancelable) || this;
            _this.objCmd = _objCmd;
            return _this;
        }
        CEFCommandEvent.prototype.clone = function () {
            return new CEFCommandEvent(this.type, this.objCmd, this.bubbles, this.cancelable);
        };
        CEFCommandEvent.OBJCMD = "objcmd";
        return CEFCommandEvent;
    }(Event));
    exports.CEFCommandEvent = CEFCommandEvent;
});
define("events/CEFScriptEvent", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Event = createjs.Event;
    var CEFScriptEvent = (function (_super) {
        __extends(CEFScriptEvent, _super);
        function CEFScriptEvent(type, _script, bubbles, cancelable) {
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            var _this = _super.call(this, type, bubbles, cancelable) || this;
            _this.script = _script;
            return _this;
        }
        CEFScriptEvent.prototype.clone = function () {
            return new CEFScriptEvent(this.type, this.script, this.bubbles, this.cancelable);
        };
        CEFScriptEvent.SCRIPT = "script";
        return CEFScriptEvent;
    }(Event));
    exports.CEFScriptEvent = CEFScriptEvent;
});
define("events/CEFActionEvent", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Event = createjs.Event;
    var CEFActionEvent = (function (_super) {
        __extends(CEFActionEvent, _super);
        function CEFActionEvent(type, Prop1, Prop2, Prop3, Prop4, Prop5, bubbles, cancelable) {
            if (Prop2 === void 0) { Prop2 = null; }
            if (Prop3 === void 0) { Prop3 = null; }
            if (Prop4 === void 0) { Prop4 = null; }
            if (Prop5 === void 0) { Prop5 = null; }
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            var _this = _super.call(this, type, bubbles, cancelable) || this;
            _this.prop1 = Prop1;
            _this.prop2 = Prop2;
            _this.prop3 = Prop3;
            _this.prop4 = Prop4;
            _this.prop5 = Prop5;
            return _this;
        }
        CEFActionEvent.prototype.clone = function () {
            return new CEFActionEvent(this.type, this.prop1, this.prop2, this.prop3, this.prop4, this.prop5, this.bubbles, this.cancelable);
        };
        CEFActionEvent.CHKCMD = "chkcmd";
        CEFActionEvent.STCCMD = "stccmd";
        CEFActionEvent.INDCMD = "indcmd";
        CEFActionEvent.RMPCMD = "rmpcmd";
        CEFActionEvent.PMTCMD = "pmtcmd";
        CEFActionEvent.NAVCMD = "navcmd";
        CEFActionEvent.EFFECT = "effect";
        return CEFActionEvent;
    }(Event));
    exports.CEFActionEvent = CEFActionEvent;
});
define("core/CEFSceneSequence", ["require", "exports", "core/CEFRoot", "core/CEFScene", "core/CEFTimer", "events/CEFNavEvent", "animationgraph/CAnimationGraph", "scenegraph/CSceneGraphNavigator", "util/CUtil", "events/CEFSceneCueEvent", "events/CEFCommandEvent", "events/CEFScriptEvent", "events/CEFActionEvent", "events/CEFEvent"], function (require, exports, CEFRoot_12, CEFScene_2, CEFTimer_1, CEFNavEvent_1, CAnimationGraph_1, CSceneGraphNavigator_1, CUtil_17, CEFSceneCueEvent_1, CEFCommandEvent_1, CEFScriptEvent_1, CEFActionEvent_1, CEFEvent_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFSceneSequence = (function (_super) {
        __extends(CEFSceneSequence, _super);
        function CEFSceneSequence() {
            var _this = _super.call(this) || this;
            _this._interval = CEFSceneSequence.DEFAULT_MONITOR_INTERVAL;
            _this.ktUpdated = false;
            _this.animationGraph = null;
            _this.traceMode = false;
            _this.initControlNames();
            _this.audioStartTimer = new CEFTimer_1.CEFTimer(10, 1);
            _this.audioStartTimer.reset();
            _this.audioStartTimer.stop();
            return _this;
        }
        CEFSceneSequence.prototype.Destructor = function () {
            CEFRoot_12.CEFRoot.gTutor.removeEventListener(CEFSceneSequence.WOZREPLAY, this.sceneReplay);
            this.disConnectAudio(this.Saudio1);
            _super.prototype.Destructor.call(this);
        };
        CEFSceneSequence.prototype.setButtonBehavior = function (behavior) {
            if (behavior == "incrScene")
                CSceneGraphNavigator_1.CSceneGraphNavigator.buttonBehavior = CSceneGraphNavigator_1.CSceneGraphNavigator.GOTONEXTSCENE;
            else
                CSceneGraphNavigator_1.CSceneGraphNavigator.buttonBehavior = CSceneGraphNavigator_1.CSceneGraphNavigator.GOTONEXTANIMATION;
        };
        CEFSceneSequence.prototype.rewindScene = function () {
            if ((CEFRoot_12.CEFRoot.gSceneConfig != null) && (CEFRoot_12.CEFRoot.gSceneConfig.scenedata[name].rewind != undefined))
                this.parseOBJ(this, CEFRoot_12.CEFRoot.gSceneConfig.scenedata[name].rewind.children(), "rewind");
            if ((CEFRoot_12.CEFRoot.gSceneConfig != null) && (CEFRoot_12.CEFRoot.gSceneConfig.scenedata[name].demoinit != undefined))
                this.parseOBJ(this, CEFRoot_12.CEFRoot.gSceneConfig.scenedata[name].demoinit.children(), "demoinit");
        };
        CEFSceneSequence.prototype.sceneReplay = function (evt) {
            if (this.traceMode)
                CUtil_17.CUtil.trace("sceneReplay: " + evt);
            this.rewindScene();
            this.parseOBJ(null, CEFRoot_12.CEFRoot.gSceneConfig.scenedata[name].preenter.children(), "preenter");
            this.audioStartTimer.reset();
            this.audioStartTimer.start();
        };
        CEFSceneSequence.prototype.scenePlay = function () {
            this.audioStartTimer.reset();
            this.audioStartTimer.start();
        };
        CEFSceneSequence.prototype.playHandler = function (evt) {
            if (this.traceMode)
                CUtil_17.CUtil.trace("CEFSceneSequence timerHandler: " + evt);
            this.audioStartTimer.stop();
            this.audioStartTimer.reset();
            if (this.Saudio1 != null) {
                this.Saudio1.gotoAndStop(1);
                this.Saudio1.bindPlay(CEFRoot_12.CEFRoot.gTutor);
            }
        };
        CEFSceneSequence.prototype.connectNavigator = function (Navigator) {
            this.navigator = Navigator;
        };
        CEFSceneSequence.prototype.connectAudio = function (audioClip) {
            if (this.traceMode)
                CUtil_17.CUtil.trace("Connect Audio Behavior");
            audioClip.stop();
            audioClip.addEventListener(CEFSceneCueEvent_1.CEFSceneCueEvent.CUEPOINT, this.doSceneCue);
            audioClip.addEventListener(CEFCommandEvent_1.CEFCommandEvent.OBJCMD, this.doActionXML);
            audioClip.addEventListener(CEFNavEvent_1.CEFNavEvent.WOZNAVINC, this.navNext);
            audioClip.addEventListener(CEFActionEvent_1.CEFActionEvent.EFFECT, this.effectHandler);
            audioClip.addEventListener(CEFScriptEvent_1.CEFScriptEvent.SCRIPT, this.scriptHandler);
        };
        CEFSceneSequence.prototype.disConnectAudio = function (audioClip) {
            if (this.traceMode)
                CUtil_17.CUtil.trace("disConnectAudio Audio Behavior");
            if (audioClip) {
                audioClip.stop();
                audioClip.removeEventListener(CEFSceneCueEvent_1.CEFSceneCueEvent.CUEPOINT, this.doSceneCue);
                audioClip.removeEventListener(CEFCommandEvent_1.CEFCommandEvent.OBJCMD, this.doActionXML);
                audioClip.removeEventListener(CEFNavEvent_1.CEFNavEvent.WOZNAVINC, this.navNext);
                audioClip.removeEventListener(CEFActionEvent_1.CEFActionEvent.EFFECT, this.effectHandler);
                audioClip.removeEventListener(CEFScriptEvent_1.CEFScriptEvent.SCRIPT, this.scriptHandler);
            }
        };
        CEFSceneSequence.prototype.bindAudio = function (audioClass) {
            if (this.traceMode)
                CUtil_17.CUtil.trace("bindAudio Behavior");
            var audio = new audioClass;
            if (audio)
                this.connectAudio(audio);
            return audio;
        };
        CEFSceneSequence.prototype.createAudio = function () {
        };
        CEFSceneSequence.prototype.initAudio = function () {
            if (this.traceMode)
                CUtil_17.CUtil.trace("Base:initAudio Behavior");
            this.createAudio();
            if (this.Saudio1)
                this.connectAudio(this.Saudio1);
        };
        CEFSceneSequence.prototype.initControlNames = function () {
        };
        CEFSceneSequence.prototype.initPrompts = function () {
        };
        CEFSceneSequence.prototype.navNext = function (event) {
            if (this.traceMode)
                CUtil_17.CUtil.trace("navNext: " + event);
            this.navigator.gotoNextScene();
        };
        CEFSceneSequence.prototype.doSceneCue = function (evt) {
            if (this.traceMode)
                CUtil_17.CUtil.trace("SceneCue: " + evt);
            this.disConnectAudio(this.Saudio1);
        };
        CEFSceneSequence.prototype.doActionXML = function (evt) {
            if (this.traceMode)
                CUtil_17.CUtil.trace("doActionXML: " + evt.objCmd);
            this.parseOBJ(this, evt.objCmd.children(), "xmlCmd");
        };
        CEFSceneSequence.prototype.parseOBJ = function (tarObj, tarOBJ, xType) {
            var element;
            if (this.traceMode)
                CUtil_17.CUtil.trace("doActionXML: " + tarOBJ);
            for (var _i = 0, tarOBJ_1 = tarOBJ; _i < tarOBJ_1.length; _i++) {
                element = tarOBJ_1[_i];
                switch (element) {
                    case "animationgraph":
                        if (element['features'] != undefined) {
                            if (!CEFRoot_12.CEFRoot.gTutor.testFeatureSet(String(element['features'])))
                                break;
                        }
                        try {
                            this.animationGraph = CAnimationGraph_1.CAnimationGraph.factory(this, "root", element.name);
                            if (this.animationGraph != null) {
                                this.Saudio1 = this.bindAudio(this.getDefinitionByName(this.animationGraph.nextAnimation()));
                                this.Saudio1.stop();
                            }
                        }
                        catch (err) {
                            CUtil_17.CUtil.trace("animationgraph JSON Spec Failed" + err);
                        }
                        break;
                    case "actionsequence":
                        if (element['features'] != undefined) {
                            if (!CEFRoot_12.CEFRoot.gTutor.testFeatureSet(String(element['features'])))
                                break;
                        }
                        this.nextActionTrack(element.selection);
                        break;
                    case "actiontrack":
                        if (element['features'] != undefined) {
                            if (!CEFRoot_12.CEFRoot.gTutor.testFeatureSet(String(element['features'])))
                                break;
                        }
                        try {
                            this.Saudio1 = this.bindAudio(this.getDefinitionByName(element.type));
                            this.Saudio1.stop();
                        }
                        catch (err) {
                            CUtil_17.CUtil.trace("CEFSceneSequence:parseOBJ: " + err);
                        }
                        break;
                }
            }
            if (tarObj)
                _super.prototype.parseOBJ.call(this, tarObj, tarOBJ, xType);
        };
        CEFSceneSequence.prototype.nextGraphAnimation = function (bNavigating) {
            if (bNavigating === void 0) { bNavigating = false; }
            var nextSeq;
            if (this.animationGraph != null) {
                if (this.Saudio1) {
                    this.disConnectAudio(this.Saudio1);
                    this.Saudio1 = null;
                }
                nextSeq = this.animationGraph.nextAnimation();
                if (nextSeq != null) {
                    this.Saudio1 = this.bindAudio(this.getDefinitionByName(nextSeq));
                    this.scenePlay();
                }
                else if (!bNavigating) {
                    this.navigator.gotoNextScene();
                }
            }
            return nextSeq;
        };
        CEFSceneSequence.prototype.nextActionTrack = function (tarXML) {
            if (tarXML === void 0) { tarXML = null; }
            if (tarXML != null) {
                this.seqTrack = tarXML;
                this.seqIndex = 0;
            }
            if (this.Saudio1) {
                this.disConnectAudio(this.Saudio1);
                this.Saudio1 = null;
            }
            while (this.seqTrack[this.seqIndex] != null) {
                this.parseOBJ(null, this.seqTrack[this.seqIndex].actiontrack, "");
                this.seqID = this.seqTrack[this.seqIndex].id;
                if (tarXML == null)
                    this.scenePlay();
                this.seqIndex++;
                if (this.Saudio1)
                    break;
            }
        };
        CEFSceneSequence.prototype.gotoActionTrackId = function (id) {
            if (id === void 0) { id = null; }
            if (id == null || id == "")
                id = this.seqID;
            if (this.Saudio1) {
                this.disConnectAudio(this.Saudio1);
                this.Saudio1 = null;
            }
            this.seqIndex = 0;
            for (var _i = 0, _a = this.seqTrack; _i < _a.length; _i++) {
                var track = _a[_i];
                this.seqIndex++;
                if (track.id == id) {
                    this.parseOBJ(null, track.actiontrack, "");
                    this.seqID = id;
                    this.scenePlay();
                }
            }
        };
        CEFSceneSequence.prototype.preEnterScene = function (lTutor, sceneLabel, sceneTitle, scenePage, Direction) {
            var result;
            if (this.traceMode)
                CUtil_17.CUtil.trace("Default Pre-Enter Scene Behavior: " + sceneTitle);
            result = _super.prototype.preEnterScene.call(this, lTutor, sceneLabel, sceneTitle, scenePage, Direction);
            this.initPrompts();
            this.initAudio();
            return result;
        };
        CEFSceneSequence.prototype.deferredEnterScene = function (Direction) {
            if ((Direction == "WOZNEXT") ||
                (Direction == "WOZGOTO")) {
                if (this.animationGraph != null) {
                    this.animationGraph.onEnterRoot();
                }
                CEFRoot_12.CEFRoot.gTutor.timeStamp.createLogAttr("dur_" + name, true);
            }
        };
        CEFSceneSequence.prototype.onEnterScene = function (Direction) {
            if (this.traceMode)
                CUtil_17.CUtil.trace("CEFSceneSequence Enter Scene Behavior:" + Direction);
            if ((Direction == "WOZNEXT") ||
                (Direction == "WOZGOTO")) {
                if (this.Saudio1)
                    this.audioStartTimer.start();
            }
            CEFRoot_12.CEFRoot.gTutor.addEventListener(CEFSceneSequence.WOZREPLAY, this.sceneReplay);
            _super.prototype.onEnterScene.call(this, Direction);
        };
        CEFSceneSequence.prototype.onExitScene = function () {
            if (this.traceMode)
                CUtil_17.CUtil.trace("CEFSceneSequence Exit Scene Behavior:");
            this.disConnectAudio(this.Saudio1);
            this.Saudio1 = null;
            CEFRoot_12.CEFRoot.gTutor.removeEventListener(CEFSceneSequence.WOZREPLAY, this.sceneReplay);
            this._sceneData = new Object;
            if ((CEFRoot_12.CEFRoot.gSceneConfig != null) && (CEFRoot_12.CEFRoot.gSceneConfig.scenedata[name].logging != undefined)) {
                this.parseOBJ(this, CEFRoot_12.CEFRoot.gSceneConfig.scenedata[name].logging.children(), "logging");
            }
            this._sceneData['scene'] = name;
            this._sceneData['iteration'] = CEFRoot_12.CEFRoot.gTutor.gNavigator.iteration.toString();
            this._sceneData['duration'] = CEFRoot_12.CEFRoot.gTutor.timeStamp.createLogAttr("dur_" + name);
            this.gLogR.logStateEvent(this._sceneData);
            if ((CEFRoot_12.CEFRoot.gSceneConfig != null) && (CEFRoot_12.CEFRoot.gSceneConfig.scenedata[name].logterm != undefined)) {
                if (CEFRoot_12.CEFRoot.gSceneConfig.scenedata[name].logterm.features != undefined) {
                    if (CEFRoot_12.CEFRoot.gTutor.testFeatureSet(String(CEFRoot_12.CEFRoot.gSceneConfig.scenedata[name].logterm.features)))
                        this.enQueueTerminateEvent();
                }
                else
                    this.enQueueTerminateEvent();
            }
            this.updateKT();
            _super.prototype.onExitScene.call(this);
        };
        CEFSceneSequence.prototype.enQueueTerminateEvent = function () {
            addEventListener(CEFEvent_6.CEFEvent.ENTER_FRAME, this._deferredTerminate);
        };
        CEFSceneSequence.prototype._deferredTerminate = function (e) {
            removeEventListener(CEFEvent_6.CEFEvent.ENTER_FRAME, this._deferredTerminate);
            this.gLogR.logTerminateEvent();
        };
        CEFSceneSequence.prototype.updateKT = function () {
            if (!this.ktUpdated) {
                this.ktUpdated = true;
            }
        };
        CEFSceneSequence.DEFAULT_MONITOR_INTERVAL = 3000;
        return CEFSceneSequence;
    }(CEFScene_2.CEFScene));
    exports.CEFSceneSequence = CEFSceneSequence;
});
define("core/CEFNavigator", ["require", "exports", "core/CEFScene", "util/CUtil", "events/CEFMouseEvent", "events/CEFEvent", "core/CEFRoot"], function (require, exports, CEFScene_3, CUtil_18, CEFMouseEvent_3, CEFEvent_7, CEFRoot_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFNavigator = (function (_super) {
        __extends(CEFNavigator, _super);
        function CEFNavigator() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.sceneCnt = 0;
            _this._inNavigation = false;
            return _this;
        }
        CEFNavigator.prototype.CEFNavigator = function () {
            this.traceMode = false;
            this.SnextButton.addEventListener(CEFMouseEvent_3.CEFMouseEvent.WOZCLICK, this.onButtonNext);
            this.SbackButton.addEventListener(CEFMouseEvent_3.CEFMouseEvent.WOZCLICK, this.onButtonPrev);
            this.gNavigator = this;
        };
        Object.defineProperty(CEFNavigator.prototype, "iteration", {
            get: function () {
                return "null";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFNavigator.prototype, "sceneObj", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        CEFNavigator.prototype.addScene = function (SceneTitle, ScenePage, SceneName, SceneClass, ScenePersist, SceneFeatures) {
            if (SceneFeatures === void 0) { SceneFeatures = "null"; }
        };
        CEFNavigator.prototype.connectToTutor = function (parentTutor, autoTutor) {
            CEFNavigator.prntTutor = parentTutor;
            CEFNavigator.TutAutomator = autoTutor;
        };
        Object.defineProperty(CEFNavigator.prototype, "scenePrev", {
            get: function () {
                return 0;
            },
            set: function (scenePrevINT) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFNavigator.prototype, "sceneCurr", {
            get: function () {
                return 0;
            },
            set: function (sceneCurrINT) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFNavigator.prototype, "sceneCurrINC", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFNavigator.prototype, "sceneCurrDEC", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFNavigator.prototype, "sceneTitle", {
            get: function () {
                return new Array();
            },
            set: function (sceneTitleARRAY) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFNavigator.prototype, "sceneSeq", {
            get: function () {
                return new Array();
            },
            set: function (sceneSeqARRAY) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFNavigator.prototype, "scenePage", {
            get: function () {
                return new Array();
            },
            set: function (scenePageARRAY) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFNavigator.prototype, "sceneName", {
            get: function () {
                return new Array();
            },
            set: function (sceneSeqARRAY) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFNavigator.prototype, "sceneClass", {
            get: function () {
                return new Array();
            },
            set: function (sceneSeqARRAY) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFNavigator.prototype, "scenePersist", {
            get: function () {
                return new Array();
            },
            set: function (sceneSeqARRAY) {
            },
            enumerable: true,
            configurable: true
        });
        CEFNavigator.prototype.findSceneOrd = function (tarScene) {
            if (this.traceMode)
                CUtil_18.CUtil.trace("findSceneOrd: " + tarScene);
            var i1;
            var ordScene = 0;
            var newScene;
            for (i1 = 0; i1 < this.sceneCnt; i1++) {
                if (this.sceneSeq[i1] == tarScene) {
                    ordScene = i1;
                    break;
                }
            }
            return ordScene;
        };
        CEFNavigator.prototype.goToScene = function (tarScene) {
            if (this.traceMode)
                CUtil_18.CUtil.trace("Nav To: " + tarScene);
            var ordScene = -1;
            var newScene = "";
            var redScene = "";
            if (this._inNavigation)
                return;
            this._inNavigation = true;
            if (CEFRoot_13.CEFRoot.fDemo)
                CEFRoot_13.CEFRoot.fDeferDemoClick = true;
            ordScene = this.findSceneOrd(tarScene);
            if (ordScene >= 0) {
                if (this.traceMode)
                    CUtil_18.CUtil.trace("Nav GoTo Found: " + tarScene);
                this.scenePrev = this.sceneCurr;
                if (tarScene == "SdemoScene") {
                    CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preExitScene("WOZGOTO", this.sceneCurr);
                    this.sceneCurr = ordScene;
                }
                else
                    switch (redScene = CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preExitScene("WOZGOTO", this.sceneCurr)) {
                        case CEFNavigator.CANCELNAV:
                            if (CEFRoot_13.CEFRoot.fDemo)
                                CEFRoot_13.CEFRoot.fDeferDemoClick = false;
                            this._inNavigation = false;
                            return;
                        case CEFNavigator.OKNAV:
                            this.sceneCurr = ordScene;
                            break;
                        default:
                            this.sceneCurr = this.findSceneOrd(redScene);
                    }
                for (redScene = this.sceneSeq[this.sceneCurr]; redScene != newScene;) {
                    if (CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]] == undefined) {
                        CEFNavigator.prntTutor.instantiateScene(this.sceneName[this.sceneCurr], this.sceneClass[this.sceneCurr]);
                    }
                    newScene = redScene;
                    redScene = CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preEnterScene(CEFNavigator.prntTutor, newScene, this.sceneTitle[this.sceneCurr], this.scenePage[this.sceneCurr], "WOZGOTO");
                    if (redScene == "WOZNEXT") {
                        this.sceneCurrINC;
                        redScene = this.sceneSeq[this.sceneCurr];
                    }
                    if (redScene == "WOZBACK") {
                        this.sceneCurrDEC;
                        redScene = this.sceneSeq[this.sceneCurr];
                    }
                    else
                        this.sceneCurr = this.findSceneOrd(redScene);
                }
                var logData = { 'navevent': 'navgoto', 'curscene': this.scenePrev, 'newscene': redScene };
                this.gLogR.logNavEvent(logData);
                CEFNavigator.TutAutomator[this.sceneSeq[this.scenePrev]].instance.onExitScene();
                CEFNavigator.prntTutor.xitions.addEventListener(CEFEvent_7.CEFEvent.COMPLETE, this.doEnterScene);
                CEFNavigator.prntTutor.xitions.gotoScene(redScene);
            }
        };
        CEFNavigator.prototype.onButtonNext = function (evt) {
            this.gotoNextScene();
        };
        CEFNavigator.prototype.recoverState = function () {
        };
        CEFNavigator.prototype.gotoNextScene = function () {
            if (this.traceMode)
                CUtil_18.CUtil.trace("Nav Next: ");
            var newScene;
            var redScene = "";
            if (this._inNavigation)
                return;
            this._inNavigation = true;
            if (CEFRoot_13.CEFRoot.fDemo)
                CEFRoot_13.CEFRoot.fDeferDemoClick = true;
            if (this.sceneCurr < this.sceneCnt) {
                if (this.traceMode)
                    CUtil_18.CUtil.trace("this.scenePrev: " + this.scenePrev + "  - this.sceneCurr: " + this.sceneCurr);
                this.scenePrev = this.sceneCurr;
                if (this.traceMode)
                    CUtil_18.CUtil.trace("this.sceneSeq[this.sceneCurr]: " + this.sceneSeq[this.sceneCurr]);
                switch (redScene = CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preExitScene("WOZNEXT", this.sceneCurr)) {
                    case CEFNavigator.CANCELNAV:
                        if (CEFRoot_13.CEFRoot.fDemo)
                            CEFRoot_13.CEFRoot.fDeferDemoClick = false;
                        this._inNavigation = false;
                        return;
                    case CEFNavigator.OKNAV:
                        this.sceneCurrINC;
                        break;
                    default:
                        this.sceneCurr = this.findSceneOrd(redScene);
                }
                for (redScene = this.sceneSeq[this.sceneCurr]; redScene != newScene;) {
                    CUtil_18.CUtil.trace(this.sceneSeq[this.sceneCurr]);
                    CUtil_18.CUtil.trace(CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]]);
                    if (CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]] == undefined) {
                        CEFNavigator.prntTutor.instantiateScene(this.sceneName[this.sceneCurr], this.sceneClass[this.sceneCurr]);
                    }
                    newScene = redScene;
                    redScene = CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preEnterScene(CEFNavigator.prntTutor, newScene, this.sceneTitle[this.sceneCurr], this.scenePage[this.sceneCurr], "WOZNEXT");
                    if (redScene == "WOZNEXT") {
                        this.sceneCurrINC;
                        redScene = this.sceneSeq[this.sceneCurr];
                    }
                    if (redScene == "WOZBACK") {
                        this.sceneCurrDEC;
                        redScene = this.sceneSeq[this.sceneCurr];
                    }
                    else
                        this.sceneCurr = this.findSceneOrd(redScene);
                }
                var logData = { 'navevent': 'navnext', 'curscene': this.scenePrev, 'newscene': redScene };
                this.gLogR.logNavEvent(logData);
                CEFNavigator.TutAutomator[this.sceneSeq[this.scenePrev]].instance.onExitScene();
                CEFNavigator.prntTutor.xitions.addEventListener(CEFEvent_7.CEFEvent.COMPLETE, this.doEnterNext);
                CEFNavigator.prntTutor.xitions.gotoScene(redScene);
            }
        };
        CEFNavigator.prototype.onButtonPrev = function (evt) {
            this.gotoPrevScene();
        };
        CEFNavigator.prototype.gotoPrevScene = function () {
            if (this.traceMode)
                CUtil_18.CUtil.trace("Nav Back: ");
            var newScene = "";
            var redScene = "";
            if (this._inNavigation)
                return;
            this._inNavigation = true;
            if (CEFRoot_13.CEFRoot.fDemo)
                CEFRoot_13.CEFRoot.fDeferDemoClick = true;
            if (this.sceneCurr >= 1) {
                this.scenePrev = this.sceneCurr;
                switch (redScene = CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preExitScene("WOZBACK", this.sceneCurr)) {
                    case CEFNavigator.CANCELNAV:
                        if (CEFRoot_13.CEFRoot.fDemo)
                            CEFRoot_13.CEFRoot.fDeferDemoClick = false;
                        this._inNavigation = false;
                        return;
                    case CEFNavigator.OKNAV:
                        this.sceneCurrDEC;
                        break;
                    default:
                        this.sceneCurr = this.findSceneOrd(redScene);
                }
                for (redScene = this.sceneSeq[this.sceneCurr]; redScene != newScene;) {
                    newScene = redScene;
                    redScene = CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preEnterScene(CEFNavigator.prntTutor, newScene, this.sceneTitle[this.sceneCurr], this.scenePage[this.sceneCurr], "WOZBACK");
                    if (redScene == "WOZNEXT") {
                        this.sceneCurrINC;
                        redScene = this.sceneSeq[this.sceneCurr];
                    }
                    if (redScene == "WOZBACK") {
                        this.sceneCurrDEC;
                        redScene = this.sceneSeq[this.sceneCurr];
                    }
                    else
                        this.sceneCurr = this.findSceneOrd(redScene);
                }
                var logData = { 'navevent': 'navback', 'curscene': this.scenePrev, 'newscene': redScene };
                this.gLogR.logNavEvent(logData);
                CEFNavigator.TutAutomator[this.sceneSeq[this.scenePrev]].instance.onExitScene();
                CEFNavigator.prntTutor.xitions.addEventListener(CEFEvent_7.CEFEvent.COMPLETE, this.doEnterBack);
                CEFNavigator.prntTutor.xitions.gotoScene(redScene);
            }
        };
        CEFNavigator.prototype.doEnterNext = function (evt) {
            if (this.traceMode)
                CUtil_18.CUtil.trace("this.doEnterNext: ", this.sceneCurr);
            CEFNavigator.prntTutor.xitions.removeEventListener(CEFEvent_7.CEFEvent.COMPLETE, this.doEnterNext);
            if (!this.scenePersist[this.scenePrev]) {
                CEFNavigator.prntTutor.destroyScene(this.sceneName[this.scenePrev]);
            }
            CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.onEnterScene("WOZNEXT");
            if (CEFRoot_13.CEFRoot.fDemo)
                CEFNavigator.prntTutor.dispatchEvent(new Event("deferedDemoCheck"));
            this._inNavigation = false;
        };
        CEFNavigator.prototype.doEnterBack = function (evt) {
            if (this.traceMode)
                CUtil_18.CUtil.trace("doEnterBack: ", this.sceneCurr);
            CEFNavigator.prntTutor.xitions.removeEventListener(CEFEvent_7.CEFEvent.COMPLETE, this.doEnterBack);
            if (!this.scenePersist[this.scenePrev]) {
                CEFNavigator.prntTutor.destroyScene(this.sceneName[this.scenePrev]);
            }
            CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.onEnterScene("WOZBACK");
            if (CEFRoot_13.CEFRoot.fDemo)
                CEFNavigator.prntTutor.dispatchEvent(new Event("deferedDemoCheck"));
            this._inNavigation = false;
        };
        CEFNavigator.prototype.doEnterScene = function (evt) {
            if (this.traceMode)
                CUtil_18.CUtil.trace("this.doEnterScene: ", this.sceneCurr);
            CEFNavigator.prntTutor.xitions.removeEventListener(CEFEvent_7.CEFEvent.COMPLETE, this.doEnterScene);
            if (!this.scenePersist[this.scenePrev]) {
                CEFNavigator.prntTutor.destroyScene(this.sceneName[this.scenePrev]);
            }
            CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.onEnterScene("WOZGOTO");
            if (CEFRoot_13.CEFRoot.fDemo)
                CEFNavigator.prntTutor.dispatchEvent(new Event("deferedDemoCheck"));
            this._inNavigation = false;
        };
        return CEFNavigator;
    }(CEFScene_3.CEFScene));
    exports.CEFNavigator = CEFNavigator;
});
define("core/CEFTimeStamp", ["require", "exports", "core/CEFObject", "util/CUtil"], function (require, exports, CEFObject_5, CUtil_19) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFTimeStamp = (function (_super) {
        __extends(CEFTimeStamp, _super);
        function CEFTimeStamp() {
            var _this = this;
            if (CEFTimeStamp._baseTime == 0)
                CEFTimeStamp._baseTime = Number(CUtil_19.CUtil.getTimer());
            _this = _super.call(this) || this;
            return _this;
        }
        CEFTimeStamp.prototype.getStartTime = function (objprop) {
            var sResult;
            var dT;
            if (!this.hasOwnProperty(objprop)) {
                sResult = 'invalid';
            }
            else {
                dT = (this[objprop] - CEFTimeStamp._baseTime) / 1000;
                sResult = dT.toFixed(3);
            }
            return sResult;
        };
        CEFTimeStamp.prototype.createLogAttr = function (objprop, restart) {
            if (restart === void 0) { restart = false; }
            var sResult;
            var dT;
            if (!this.hasOwnProperty(objprop)) {
                this[objprop] = Number(CUtil_19.CUtil.getTimer());
                dT = (this[objprop] - CEFTimeStamp._baseTime) / 1000;
            }
            else {
                if (restart)
                    this[objprop] = Number(CUtil_19.CUtil.getTimer());
                dT = (Number(CUtil_19.CUtil.getTimer()) - this[objprop]) / 1000;
            }
            return sResult = dT.toFixed(3);
        };
        CEFTimeStamp._baseTime = 0;
        return CEFTimeStamp;
    }(CEFObject_5.CEFObject));
    exports.CEFTimeStamp = CEFTimeStamp;
});
define("controls/CEFSkillBar", ["require", "exports", "core/CEFObject"], function (require, exports, CEFObject_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFSkillBar = (function (_super) {
        __extends(CEFSkillBar, _super);
        function CEFSkillBar() {
            var _this = _super.call(this) || this;
            _this.level = 0;
            return _this;
        }
        Object.defineProperty(CEFSkillBar.prototype, "skillName", {
            get: function () {
                return this._name;
            },
            set: function (newName) {
                this._name = newName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFSkillBar.prototype, "level", {
            get: function () {
                return this._level;
            },
            set: function (newLevel) {
                this._invlevel = 1 - newLevel;
                this._level = newLevel;
                this.Smask.x = -(this.SprogBar['width'] * this._invlevel);
                this._level *= 100;
                this.Stext.text = this._level.toFixed(0) + '%';
            },
            enumerable: true,
            configurable: true
        });
        return CEFSkillBar;
    }(CEFObject_6.CEFObject));
    exports.CEFSkillBar = CEFSkillBar;
});
define("controls/CEFSkilloMeter", ["require", "exports", "core/CEFObject", "events/CEFMouseEvent"], function (require, exports, CEFObject_7, CEFMouseEvent_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFSkilloMeter = (function (_super) {
        __extends(CEFSkilloMeter, _super);
        function CEFSkilloMeter() {
            var _this = _super.call(this) || this;
            _this.tfValue = new Array(6);
            var i1;
            _this = _super.call(this) || this;
            for (i1 = 0; i1 < 6; i1++)
                _this.updateSkill(i1 + 1, 0, "");
            _this.addEventListener(CEFMouseEvent_4.CEFMouseEvent.CLICK, _this.skillClick);
            return _this;
        }
        CEFSkilloMeter.prototype.Destructor = function () {
            _super.prototype.Destructor.call(this);
        };
        CEFSkilloMeter.prototype.updateSkill = function (index, newValue, tfVal) {
            this["Sskill" + index].level = newValue;
            this.tfValue[index - 1] = tfVal;
        };
        CEFSkilloMeter.prototype.updateName = function (index, newName) {
            this["Sskill" + index].skillName = newName;
        };
        Object.defineProperty(CEFSkilloMeter.prototype, "title", {
            set: function (newTitle) {
                this.Stitle.text = newTitle;
            },
            enumerable: true,
            configurable: true
        });
        CEFSkilloMeter.prototype.skillClick = function (evt) {
            var i1;
            var SkillData = "";
            for (i1 = 1; i1 <= 6; i1++) {
                SkillData += this["Sskill" + i1].skillName;
                SkillData += ": ";
                SkillData += this["Sskill" + i1].level;
                SkillData += ": ";
                SkillData += this.tfValue[i1 - 1];
                SkillData += "\n";
            }
        };
        return CEFSkilloMeter;
    }(CEFObject_7.CEFObject));
    exports.CEFSkilloMeter = CEFSkilloMeter;
});
define("core/CEFTitleBar", ["require", "exports", "core/CEFRoot", "core/CEFScene", "core/CEFObject", "events/CEFMouseEvent", "events/CEFNavEvent", "util/CUtil"], function (require, exports, CEFRoot_14, CEFScene_4, CEFObject_8, CEFMouseEvent_5, CEFNavEvent_2, CUtil_20) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFTitleBar = (function (_super) {
        __extends(CEFTitleBar, _super);
        function CEFTitleBar() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._demoInhibit = false;
            _this._demoClicked = false;
            return _this;
        }
        CEFTitleBar.prototype.CEFTitleBar = function () {
            if (this.traceMode)
                CUtil_20.CUtil.trace("CEFTitleBar:Constructor");
            try {
                this.Splay.addEventListener(CEFMouseEvent_5.CEFMouseEvent.WOZCLICK, this.onTutorPlay);
                this.Spause.addEventListener(CEFMouseEvent_5.CEFMouseEvent.WOZCLICK, this.onTutorPause);
                this.Sreplay.addEventListener(CEFMouseEvent_5.CEFMouseEvent.WOZCLICK, this.onTutorReplay);
                this.Splay.visible = false;
                this.Sskill.visible = CEFRoot_14.CEFRoot.fSkillometer;
                this.Sskill.title = "skills";
                this.Sskill.updateName(1, "rule0");
                this.Sskill.updateName(2, "rule1");
                this.Sskill.updateName(3, "rule2");
                this.Sskill.updateName(4, "rule_vvfar");
                this.Sskill.updateName(5, "rule_tov");
                this.Sskill.updateName(6, "rule_cvslog");
            }
            catch (err) {
            }
        };
        CEFTitleBar.prototype.configDemoButton = function (_Tutor) {
            if (CEFRoot_14.CEFRoot.fDemo) {
                if (this.traceMode)
                    CUtil_20.CUtil.trace("Title in Demo Mode");
                this.SdemoButton.addEventListener(CEFMouseEvent_5.CEFMouseEvent.WOZCLICKED, this.doDemoClick);
                _Tutor.addEventListener("deferedDemoCheck", this.doDeferedDemoClick);
            }
            else {
                this.SdemoButton.visible = false;
                this.addEventListener(CEFMouseEvent_5.CEFMouseEvent.WOZCLICKED, this.doTitleClick);
            }
        };
        CEFTitleBar.prototype.doTitleClick = function (evt) {
            if (this.traceMode)
                CUtil_20.CUtil.trace("TitleClick");
        };
        CEFTitleBar.prototype.doDemoClick = function (evt) {
            if (CEFRoot_14.CEFRoot.fDeferDemoClick)
                this._demoClicked = true;
            else
                CEFRoot_14.CEFRoot.gTutor.goToScene(new CEFNavEvent_2.CEFNavEvent(CEFNavEvent_2.CEFNavEvent.WOZNAVTO, "SdemoScene"));
        };
        CEFTitleBar.prototype.doDeferedDemoClick = function (evt) {
            CEFRoot_14.CEFRoot.fDeferDemoClick = false;
            if (this._demoClicked) {
                this._demoClicked = false;
                CEFRoot_14.CEFRoot.gTutor.goToScene(new CEFNavEvent_2.CEFNavEvent(CEFNavEvent_2.CEFNavEvent.WOZNAVTO, "SdemoScene"));
            }
        };
        CEFTitleBar.prototype.onTutorPlay = function (evt) {
            if (this.traceMode)
                CUtil_20.CUtil.trace("onTutorPlay: ");
            CEFRoot_14.CEFRoot.gTutor.wozPlay();
            this.Splay.visible = false;
            this.Spause.visible = true;
        };
        CEFTitleBar.prototype.onTutorPause = function (evt) {
            if (this.traceMode)
                CUtil_20.CUtil.trace("onTutorPause: ");
            CEFRoot_14.CEFRoot.gTutor.wozPause();
            this.Spause.visible = false;
            this.Splay.visible = true;
        };
        CEFTitleBar.prototype.onTutorReplay = function (evt) {
            if (this.traceMode)
                CUtil_20.CUtil.trace("onTutorReplay: ");
            CEFRoot_14.CEFRoot.gTutor.wozReplay();
        };
        CEFTitleBar.prototype.setObjMode = function (TutScene, sMode) {
            if (this.traceMode)
                CUtil_20.CUtil.trace("\t*** Start - Walking Top Level Nav Objects***");
            for (var sceneObj in TutScene) {
                if (sceneObj != "instance" && TutScene[sceneObj].instance instanceof CEFObject_8.CEFObject) {
                    TutScene[sceneObj].instance.setAutomationMode(TutScene[sceneObj], sMode);
                }
            }
            if (this.traceMode)
                CUtil_20.CUtil.trace("\t*** End - Walking Top Level Nav Objects***");
        };
        CEFTitleBar.prototype.dumpSceneObjs = function (TutScene) {
            for (var sceneObj in TutScene) {
                if (this.traceMode)
                    CUtil_20.CUtil.trace("\tNavPanelObj : " + sceneObj);
                if (sceneObj != "instance" && TutScene[sceneObj].instance instanceof CEFObject_8.CEFObject) {
                    if (this.traceMode)
                        CUtil_20.CUtil.trace("\tCEF***");
                    TutScene[sceneObj].instance.dumpSubObjs(TutScene[sceneObj], "\t");
                }
            }
        };
        return CEFTitleBar;
    }(CEFScene_4.CEFScene));
    exports.CEFTitleBar = CEFTitleBar;
});
define("scenes/CEFScene0", ["require", "exports", "core/CEFSceneSequence", "util/CUtil"], function (require, exports, CEFSceneSequence_1, CUtil_21) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFScene0 = (function (_super) {
        __extends(CEFScene0, _super);
        function CEFScene0() {
            var _this = _super.call(this) || this;
            CUtil_21.CUtil.trace("CEFScene0:Constructor");
            return _this;
        }
        CEFScene0.prototype.captureDefState = function (TutScene) {
            _super.prototype.captureDefState.call(this, TutScene);
        };
        CEFScene0.prototype.restoreDefState = function (TutScene) {
            _super.prototype.restoreDefState.call(this, TutScene);
        };
        return CEFScene0;
    }(CEFSceneSequence_1.CEFSceneSequence));
    exports.CEFScene0 = CEFScene0;
});
define("kt/CEFBNode", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFBNode = (function () {
        function CEFBNode() {
            this._aritytags = new Array;
            this._vector = new Array;
        }
        CEFBNode.prototype.getValue = function (row, col) {
            return this._vector[row][col];
        };
        CEFBNode.prototype.setValue = function (row, col, newVal) {
            this._vector[row][col] = newVal;
        };
        CEFBNode.prototype.normalize = function () {
            var sum;
            var i1;
            var i2;
            var width = this._vector[0].length;
            for (i2 = 0; i2 < width; i2++) {
                sum = 0;
                for (i1 = 0; i1 < this._arity; i1++)
                    sum += this._vector[i1][i2];
                for (i1 = 0; i1 < this._arity; i1++)
                    this._vector[i1][i2] /= sum;
            }
        };
        CEFBNode.prototype.tagToNdx = function (tag) {
            var i1;
            for (i1 = 0; i1 < this._arity; i1++) {
                if (this._aritytags[i1] == tag)
                    return i1;
            }
            return -1;
        };
        CEFBNode.prototype.loadXML = function (xmlSrc) {
            var i1;
            this._name = xmlSrc.name;
            this._arity = xmlSrc.arity;
            this._aritytags = xmlSrc.aritytags[0].split(',');
            for (i1 = 0; i1 < this._arity; i1++) {
                this._vector.push(xmlSrc.values[i1].split(','));
            }
        };
        CEFBNode.prototype.saveXML = function () {
            var propVector;
            return propVector;
        };
        return CEFBNode;
    }());
    exports.CEFBNode = CEFBNode;
});
define("events/CEFPropertyChangeEventKind", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFPropertyChangeEventKind = (function () {
        function CEFPropertyChangeEventKind() {
        }
        CEFPropertyChangeEventKind.UPDATE = "update";
        CEFPropertyChangeEventKind.DELETE = "delete";
        return CEFPropertyChangeEventKind;
    }());
    exports.CEFPropertyChangeEventKind = CEFPropertyChangeEventKind;
});
define("events/CEFPropertyChangeEvent", ["require", "exports", "events/CEFPropertyChangeEventKind"], function (require, exports, CEFPropertyChangeEventKind_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Event = createjs.Event;
    var CEFPropertyChangeEvent = (function (_super) {
        __extends(CEFPropertyChangeEvent, _super);
        function CEFPropertyChangeEvent(type, bubbles, cancelable, kind, property, oldValue, newValue, source) {
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            if (kind === void 0) { kind = null; }
            if (property === void 0) { property = null; }
            if (oldValue === void 0) { oldValue = null; }
            if (newValue === void 0) { newValue = null; }
            if (source === void 0) { source = null; }
            var _this = _super.call(this, type, bubbles, cancelable) || this;
            _this.kind = kind;
            _this.property = property;
            _this.oldValue = oldValue;
            _this.newValue = newValue;
            _this.source = source;
            return _this;
        }
        CEFPropertyChangeEvent.createUpdateEvent = function (source, property, oldValue, newValue) {
            var event = new CEFPropertyChangeEvent(CEFPropertyChangeEvent.PROPERTY_CHANGE);
            event.kind = CEFPropertyChangeEventKind_1.CEFPropertyChangeEventKind.UPDATE;
            event.oldValue = oldValue;
            event.newValue = newValue;
            event.source = source;
            event.property = property;
            return event;
        };
        CEFPropertyChangeEvent.prototype.clone = function () {
            return new CEFPropertyChangeEvent(this.type, this.bubbles, this.cancelable, this.kind, this.property, this.oldValue, this.newValue, this.source);
        };
        CEFPropertyChangeEvent.PROPERTY_CHANGE = "propertyChange";
        return CEFPropertyChangeEvent;
    }(Event));
    exports.CEFPropertyChangeEvent = CEFPropertyChangeEvent;
});
define("kt/CEFKTNode", ["require", "exports", "kt/CEFBNode", "events/CEFPropertyChangeEvent"], function (require, exports, CEFBNode_1, CEFPropertyChangeEvent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var EventDispatcher = createjs.EventDispatcher;
    var CEFKTNode = (function (_super) {
        __extends(CEFKTNode, _super);
        function CEFKTNode() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CEFKTNode.prototype.CEFKTNode = function () {
            this._hypoNode = new CEFBNode_1.CEFBNode;
            this._evidNode = new CEFBNode_1.CEFBNode;
        };
        Object.defineProperty(CEFKTNode.prototype, "newEvid", {
            set: function (evid) {
                var oldValue = this._hypoNode.getValue(0, 0);
                var evidNdx = this._evidNode.tagToNdx(evid);
                var i1;
                for (i1 = 0; i1 < this._arity; i1++) {
                    this._hypoNode.setValue(i1, 0, this._evidNode.getValue(evidNdx, i1) * this._hypoNode.getValue(i1, 0));
                }
                this._hypoNode.normalize();
                this.dispatchBeliefChangedEvent(oldValue);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFKTNode.prototype, "predValue", {
            get: function () {
                var prediction = 0;
                prediction += this._evidNode.getValue(0, 0) * this._hypoNode.getValue(0, 0);
                prediction += this._evidNode.getValue(0, 1) * this._hypoNode.getValue(1, 0);
                return prediction;
            },
            enumerable: true,
            configurable: true
        });
        CEFKTNode.prototype.dispatchBeliefChangedEvent = function (oldValue) {
            if (this.hasEventListener("propertyChange"))
                this.dispatchEvent(CEFPropertyChangeEvent_1.CEFPropertyChangeEvent.createUpdateEvent(this._hypoNode, "value", oldValue, this._hypoNode.getValue(0, 0)));
        };
        Object.defineProperty(CEFKTNode.prototype, "BeliefName", {
            get: function () {
                return this._hypoNode._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFKTNode.prototype, "BeliefValue", {
            get: function () {
                return this._hypoNode.getValue(0, 0);
            },
            enumerable: true,
            configurable: true
        });
        CEFKTNode.prototype.loadXML = function (xmlSrc) {
            this._name = xmlSrc.name;
            this._pT = xmlSrc.pt;
            this._hypoNode.loadXML(xmlSrc.hyponode[0]);
            this._evidNode.loadXML(xmlSrc.evidnode[0]);
            this._arity = this._hypoNode._arity;
        };
        CEFKTNode.prototype.saveXML = function () {
            var propVector;
            return propVector;
        };
        return CEFKTNode;
    }(EventDispatcher));
    exports.CEFKTNode = CEFKTNode;
});
define("network/CLogManagerType", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CLogManagerType = (function () {
        function CLogManagerType() {
        }
        CLogManagerType.prototype.readonlyructor = function () {
        };
        CLogManagerType.RECLOGNONE = 0;
        CLogManagerType.RECORDEVENTS = 1;
        CLogManagerType.LOGEVENTS = 2;
        CLogManagerType.RECLOGEVENTS = 3;
        CLogManagerType.MODE_JSON = "MODE_JSON";
        CLogManagerType.JSON_ACKLOG = "JSON_ACKLOG";
        CLogManagerType.JSON_ACKTERM = "JSON_ACKTERM";
        return CLogManagerType;
    }());
    exports.CLogManagerType = CLogManagerType;
});
define("events/CEFKeyboardEvent", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Event = createjs.Event;
    var CEFKeyboardEvent = (function (_super) {
        __extends(CEFKeyboardEvent, _super);
        function CEFKeyboardEvent(type, bubbles, cancelable) {
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            return _super.call(this, type, bubbles, cancelable) || this;
        }
        CEFKeyboardEvent.KEY_PRESS = "keypress";
        CEFKeyboardEvent.KEY_DOWN = "keydown";
        CEFKeyboardEvent.KEY_UP = "keyup";
        return CEFKeyboardEvent;
    }(Event));
    exports.CEFKeyboardEvent = CEFKeyboardEvent;
});
define("core/CEFTutorRoot", ["require", "exports", "core/CEFRoot", "core/CEFDoc", "core/CEFObject", "core/CEFCursorProxy", "core/CEFTransitions", "core/CEFTimeStamp", "core/CEFScene", "core/CEFSceneSequence", "events/CEFEvent", "events/CEFNavEvent", "events/CEFMouseEvent", "util/CUtil", "kt/CEFKTNode", "network/CLogManagerType", "events/CEFKeyboardEvent"], function (require, exports, CEFRoot_15, CEFDoc_3, CEFObject_9, CEFCursorProxy_1, CEFTransitions_1, CEFTimeStamp_1, CEFScene_5, CEFSceneSequence_2, CEFEvent_8, CEFNavEvent_3, CEFMouseEvent_6, CUtil_22, CEFKTNode_1, CLogManagerType_1, CEFKeyboardEvent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MovieClip = createjs.MovieClip;
    var DisplayObjectContainer = createjs.Container;
    var CEFTutorRoot = (function (_super) {
        __extends(CEFTutorRoot, _super);
        function CEFTutorRoot() {
            var _this = _super.call(this) || this;
            _this.fFeatures = new Array();
            _this.fDefaults = new Array();
            _this.fIntroVideo = false;
            _this.fCVSIntro = true;
            _this.fRampsIntro = true;
            _this.fRampPreTest = false;
            _this.fFreeResponse = 0;
            _this.fStepByStep0 = false;
            _this.fStepByStep1 = false;
            _this.fEIA = true;
            _this.fEIB = true;
            _this.fEIC = true;
            _this.fSummaryVideo = false;
            _this.fRampPostTest = true;
            _this.timeStamp = new CEFTimeStamp_1.CEFTimeStamp;
            _this.playing = new Array();
            _this.isPaused = false;
            _this.scenePtr = new Array;
            _this.stateStack = new Array();
            _this.sceneCnt = 0;
            _this.xitions = new CEFTransitions_1.CEFTransitions;
            _this.replayIndex = new Array;
            _this.replayTime = 0;
            _this.Running = new Array();
            _this.runCount = 0;
            _this.ktNets = new Object;
            _this.sceneGraph = "<sceneGraph/>";
            _this.traceMode = false;
            if (_this.traceMode)
                CUtil_22.CUtil.trace("CEFTutorRoot:Constructor");
            CEFRoot_15.CEFRoot.gTutor = _this;
            _this.tutorAutoObj = new Object;
            return _this;
        }
        CEFTutorRoot.prototype.resetZorder = function () {
            this.StitleBar.setTopMost();
            this.Sscene0.setTopMost();
        };
        CEFTutorRoot.prototype.captureSceneGraph = function () {
        };
        CEFTutorRoot.prototype.setTutorDefaults = function (featSet) {
            var feature;
            var featArray = featSet.split(":");
            this.fDefaults = new Array();
            for (var _i = 0, featArray_1 = featArray; _i < featArray_1.length; _i++) {
                var feature_1 = featArray_1[_i];
                this.fDefaults.push(feature_1);
            }
        };
        CEFTutorRoot.prototype.setTutorFeatures = function (featSet) {
            var feature;
            var featArray = new Array;
            if (featSet.length > 0)
                featArray = featSet.split(":");
            this.fFeatures = new Array();
            for (var _i = 0, _a = this.fDefaults; _i < _a.length; _i++) {
                var feature_2 = _a[_i];
                this.fFeatures.push(feature_2);
            }
            for (var _b = 0, featArray_2 = featArray; _b < featArray_2.length; _b++) {
                var feature_3 = featArray_2[_b];
                this.fFeatures.push(feature_3);
            }
        };
        Object.defineProperty(CEFTutorRoot.prototype, "features", {
            get: function () {
                return this.fFeatures.join(":");
            },
            set: function (ftrSet) {
                this.fFeatures = ftrSet.split(":");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFTutorRoot.prototype, "addFeature", {
            set: function (feature) {
                if (this.fFeatures.indexOf(feature) == -1) {
                    this.fFeatures.push(feature);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFTutorRoot.prototype, "delFeature", {
            set: function (feature) {
                var fIndex;
                if ((fIndex = this.fFeatures.indexOf(feature)) != -1) {
                    this.fFeatures.splice(fIndex, 1);
                }
            },
            enumerable: true,
            configurable: true
        });
        CEFTutorRoot.prototype.testFeature = function (element, index, arr) {
            if (element.charAt(0) == "!") {
                return (this.fFeatures.indexOf(element.substring(1)) != -1) ? false : true;
            }
            else
                return (this.fFeatures.indexOf(element) != -1) ? true : false;
        };
        CEFTutorRoot.prototype.testFeatureSet = function (featSet) {
            var feature;
            var disjFeat = featSet.split(":");
            var conjFeat;
            if (featSet == "")
                return true;
            for (var _i = 0, disjFeat_1 = disjFeat; _i < disjFeat_1.length; _i++) {
                var feature_4 = disjFeat_1[_i];
                conjFeat = feature_4.split(",");
                if (conjFeat.every(this.testFeature))
                    return true;
            }
            return false;
        };
        CEFTutorRoot.prototype.traceFeatures = function () {
            CUtil_22.CUtil.trace(this.fFeatures);
        };
        CEFTutorRoot.prototype.addScene = function (sceneTitle, scenePage, sceneName, sceneClass, sceneFeatures, sceneEnqueue, sceneCreate, sceneVisible, scenePersist, sceneObj) {
            if (sceneObj === void 0) { sceneObj = null; }
            if (sceneEnqueue)
                this.SnavPanel.addScene(sceneTitle, scenePage, sceneName, sceneClass, scenePersist, sceneFeatures);
            if (sceneCreate)
                this.instantiateScene(sceneName, sceneClass, sceneVisible);
            if (sceneObj != null)
                this.automateScene(sceneName, sceneObj, false);
        };
        CEFTutorRoot.prototype.instantiateScene = function (sceneName, sceneClass, sceneVisible) {
            if (sceneVisible === void 0) { sceneVisible = false; }
            var i1;
            var tarScene;
            var subScene;
            var ClassRef = this.getDefinitionByName(sceneClass);
            tarScene = new ClassRef();
            if (this.traceMode)
                CUtil_22.CUtil.trace("Creating Scene : " + sceneName);
            this.addChild(tarScene);
            tarScene.visible = false;
            tarScene.stop();
            if (sceneVisible) {
                this[sceneName] = tarScene;
                tarScene.visible = true;
            }
            this.automateScene(sceneName, tarScene);
            tarScene.addEventListener("Start", this.questionStart);
            tarScene.addEventListener("Done", this.questionComplete);
            tarScene.addEventListener(CEFNavEvent_3.CEFNavEvent.WOZNAVBACK, this.goBackScene);
            tarScene.addEventListener(CEFNavEvent_3.CEFNavEvent.WOZNAVNEXT, this.goNextScene);
            tarScene.addEventListener(CEFNavEvent_3.CEFNavEvent.WOZNAVTO, this.goToScene);
            for (i1 = 0; i1 < tarScene.numChildren; i1++) {
                subScene = tarScene.getChildAt(i1);
                if (subScene instanceof MovieClip)
                    subScene.gotoAndStop(1);
            }
            return tarScene;
        };
        CEFTutorRoot.prototype.destroyScene = function (sceneName) {
            var sceneObj = this.getChildByName(sceneName);
            var wozObj;
            if (sceneObj != null) {
                sceneObj.removeEventListener("Start", this.questionStart);
                sceneObj.removeEventListener("Done", this.questionComplete);
                sceneObj.removeEventListener(CEFNavEvent_3.CEFNavEvent.WOZNAVBACK, this.goBackScene);
                sceneObj.removeEventListener(CEFNavEvent_3.CEFNavEvent.WOZNAVNEXT, this.goNextScene);
                sceneObj.removeEventListener(CEFNavEvent_3.CEFNavEvent.WOZNAVTO, this.goToScene);
                if (sceneObj instanceof CEFObject_9.CEFObject) {
                    wozObj = sceneObj;
                    wozObj.Destructor();
                }
                this.removeChild(sceneObj);
            }
            if (this.traceMode)
                CUtil_22.CUtil.trace("Destroying Scene : " + sceneName);
            if (this.hasOwnProperty(sceneName)) {
                this[sceneName] = null;
                if (this.tutorAutoObj.hasOwnProperty(sceneName)) {
                    this.tutorAutoObj[sceneName].instance = null;
                    delete this.tutorAutoObj[sceneName];
                }
            }
        };
        CEFTutorRoot.prototype.automateScene = function (sceneName, sceneObj, nameObj) {
            if (nameObj === void 0) { nameObj = true; }
            this[sceneName] = sceneObj;
            if (nameObj)
                this[sceneName].name = sceneName;
            if (sceneObj instanceof CEFSceneSequence_2.CEFSceneSequence)
                sceneObj.connectNavigator(this.SnavPanel);
            this.tutorAutoObj[sceneName] = new Object;
            this.tutorAutoObj[sceneName].instance = sceneObj;
            sceneObj.initAutomation(sceneObj, this.tutorAutoObj[sceneName], "", this.gLogR, this);
            sceneObj.captureDefState(this.tutorAutoObj[sceneName]);
            sceneObj.restoreDefState(this.tutorAutoObj[sceneName]);
            this.resetZorder();
        };
        CEFTutorRoot.prototype.instantiateKT = function () {
            if ((CEFRoot_15.CEFRoot.gSceneConfig != null) && (CEFRoot_15.CEFRoot.gSceneConfig.ktnets != undefined))
                this.loadKTNets(CEFRoot_15.CEFRoot.gSceneConfig.ktnets);
        };
        CEFTutorRoot.prototype.loadKTNets = function (tarXML) {
            for (var _i = 0, tarXML_1 = tarXML; _i < tarXML_1.length; _i++) {
                var ktnet = tarXML_1[_i];
                this.ktNets[ktnet.name] = new CEFKTNode_1.CEFKTNode;
                this.ktNets[ktnet.name].loadXML(ktnet);
            }
        };
        CEFTutorRoot.prototype.recurseXML = function (xmlNodes, xmlTar, newVal) {
            var xml = xmlTar;
            var ndx;
            var len = xmlNodes.length;
            var attr;
            var node;
            var value;
            for (var nodeId = 0; nodeId < len; nodeId++) {
                if (xmlNodes[nodeId] == '@') {
                    attr = xmlNodes[nodeId + 1];
                    if (this.traceMode)
                        CUtil_22.CUtil.trace(typeof (xml[attr]));
                    if (this.traceMode)
                        CUtil_22.CUtil.trace(xml[attr]);
                    (newVal != null) ? xml[attr] = value = newVal : value = xml[attr];
                    nodeId++;
                }
                else {
                    node = xmlNodes[nodeId];
                    if ((nodeId + 1) < len) {
                        attr = xmlNodes[nodeId + 1];
                        if (isNaN(Number(attr))) {
                            xml = xml[node];
                        }
                        else {
                            ndx = Number(attr);
                            if ((nodeId + 2) < len)
                                xml = xml[node][ndx];
                            else
                                (newVal != null) ? xml[node][ndx] = value = newVal : value = xml[node][ndx];
                            nodeId++;
                        }
                    }
                    else
                        (newVal != null) ? xml[node] = value = newVal : value = xml[node];
                }
            }
            if (this.traceMode)
                CUtil_22.CUtil.trace("Final Result: " + value);
            return value;
        };
        CEFTutorRoot.prototype.state = function (xmlSpec, newVal) {
            if (newVal === void 0) { newVal = null; }
            var nodeArray;
            nodeArray = xmlSpec.split(".");
            if (this.traceMode)
                CUtil_22.CUtil.trace("Node Array: " + nodeArray);
            return this.recurseXML(nodeArray, CEFTutorRoot.gSceneConfig.state[0], newVal);
        };
        CEFTutorRoot.prototype.scene = function (xmlSpec, newVal) {
            if (newVal === void 0) { newVal = null; }
            var nodeArray;
            nodeArray = xmlSpec.split(".");
            if (this.traceMode)
                CUtil_22.CUtil.trace("Node Array: " + nodeArray);
            return this.recurseXML(nodeArray, CEFTutorRoot.gSceneConfig.scenedata[0], newVal);
        };
        CEFTutorRoot.prototype.wozReplay = function () {
            if (this.traceMode)
                CUtil_22.CUtil.trace(" wozReplay : ", this.playing.length);
            this.wozStopPlay();
            dispatchEvent(new Event(CEFRoot_15.CEFRoot.WOZCANCEL));
            dispatchEvent(new Event(CEFRoot_15.CEFRoot.WOZREPLAY));
        };
        CEFTutorRoot.prototype.wozStopPlay = function () {
            if (this.traceMode)
                CUtil_22.CUtil.trace(" wozStopPlay : ", this.playing.length);
            var tCount = this.playing.length;
            for (var i1 = 0; i1 < tCount; i1++) {
                this.playing.pop();
            }
        };
        CEFTutorRoot.prototype.wozPause = function () {
            if (this.traceMode)
                CUtil_22.CUtil.trace(" wozPause : ", this.playing.length);
            this.isPaused = true;
            this.dispatchEvent(new Event(CEFTutorRoot.WOZPAUSING));
            for (var i1 = 0; i1 < this.playing.length; i1++) {
            }
        };
        CEFTutorRoot.prototype.wozPlay = function () {
            if (this.traceMode)
                CUtil_22.CUtil.trace(" wozPlay : ", this.playing.length);
            this.isPaused = false;
            this.dispatchEvent(new Event(CEFTutorRoot.WOZPLAYING));
            for (var i1 = 0; i1 < this.playing.length; i1++) {
            }
        };
        CEFTutorRoot.prototype.playRemoveThis = function (wozObj) {
            if (this.traceMode)
                CUtil_22.CUtil.trace(" playRemoveThis : ", wozObj.name, this.playing.length);
            for (var i1 = 0; i1 < this.playing.length; i1++) {
                if (this.playing[i1] == wozObj) {
                    CEFDoc_3.CEFDoc.gApp.incStateID();
                    this.playing.splice(i1, 1);
                    break;
                }
            }
        };
        CEFTutorRoot.prototype.playAddThis = function (wozObj) {
            if (this.traceMode)
                CUtil_22.CUtil.trace(" playAddThis : ", wozObj.name, this.playing.length);
            var fAdd = true;
            for (var i1 = 0; i1 < this.playing.length; i1++) {
                if (this.playing[i1] == wozObj) {
                    fAdd = false;
                    break;
                }
            }
            if (fAdd)
                this.playing.push(wozObj);
        };
        CEFTutorRoot.prototype.showPPlay = function (fShow) {
            this.StitleBar.Spause.visible = fShow;
        };
        CEFTutorRoot.prototype.showReplay = function (fShow) {
            this.StitleBar.Sreplay.visible = fShow;
        };
        CEFTutorRoot.prototype.setCursor = function (sMode) {
            if (this.traceMode)
                CUtil_22.CUtil.trace("switching mouse ownership");
            if (this.cCursor) {
                this.cCursor.initWOZCursor(sMode);
            }
        };
        CEFTutorRoot.prototype.replaceCursor = function () {
            if (this.traceMode)
                CUtil_22.CUtil.trace("Creating Mouse Pointer");
            if (!this.cCursor) {
                this.cCursor = new CEFCursorProxy_1.CEFCursorProxy;
                this.cCursor.visible = false;
                CEFRoot_15.CEFRoot.gTutor.addChild(this.cCursor);
            }
            this.cCursor.initWOZCursor(CEFCursorProxy_1.CEFCursorProxy.WOZLIVE);
            this.cCursor.show(false);
        };
        CEFTutorRoot.prototype.initAutomation = function (tutorObj) {
            if (this.traceMode)
                CUtil_22.CUtil.trace("Init Automation:");
            this.xitions.connectToTutor(this, this.tutorAutoObj);
            this.SnavPanel.connectToTutor(this, this.tutorAutoObj);
        };
        CEFTutorRoot.prototype.initializeScenes = function () {
        };
        CEFTutorRoot.prototype.captureDefState = function (Tutor) {
            if (this.traceMode)
                CUtil_22.CUtil.trace("\t*** Start Capture - Walking Scenes***");
            for (var scene in Tutor) {
                if (this.traceMode)
                    CUtil_22.CUtil.trace("\tSCENE : " + scene);
                if (scene != "instance" && Tutor[scene].instance instanceof CEFScene_5.CEFScene) {
                    Tutor[scene].instance.captureDefState(Tutor[scene]);
                }
            }
            if (this.traceMode)
                CUtil_22.CUtil.trace("\t*** End Capture - Walking Scenes***");
        };
        CEFTutorRoot.prototype.restoreDefState = function (Tutor) {
            if (this.traceMode)
                CUtil_22.CUtil.trace("\t*** Start Restore - Walking Scenes***");
            for (var scene in Tutor) {
                if (this.traceMode)
                    CUtil_22.CUtil.trace("\tSCENE : " + scene);
                if (scene != "instance" && Tutor[scene].instance instanceof CEFScene_5.CEFScene) {
                    if (this.traceMode)
                        CUtil_22.CUtil.trace("reseting: " + scene);
                    Tutor[scene].instance.restoreDefState(Tutor[scene]);
                }
            }
            if (this.traceMode)
                CUtil_22.CUtil.trace("\t*** End Restore - Walking Scenes***");
        };
        CEFTutorRoot.prototype.doPlayBack = function (pbSource) {
            if (this.traceMode)
                CUtil_22.CUtil.trace("\t*** Start - Playback Stream ***");
            this.cCursor.initWOZCursor(CEFCursorProxy_1.CEFCursorProxy.WOZREPLAY);
            this.cCursor.setCursorStyle("Sautomate");
            this.cCursor.setTopMost();
            this.cCursor.show(true);
            this.cCursor.initPlayBack();
            this.stateStack.push(this.baseTime);
            this.stateStack.push(CEFDoc_3.CEFDoc.gApp.stateID);
            this.stateStack.push(CEFDoc_3.CEFDoc.gApp.frameID);
            this.stateStack.push(this.gLogR.fLogging);
            this.gLogR.fLogging = CLogManagerType_1.CLogManagerType.RECLOGNONE;
            this.gLogR.setPlayBackSource(pbSource);
            if (pbSource[0].version == "1") {
                this.gLogR.normalizePlayBackTime();
                this.baseTime = CUtil_22.CUtil.getTimer();
                addEventListener(CEFEvent_8.CEFEvent.ENTER_FRAME, this.playBackByTime);
                if (CEFTutorRoot.fDemo) {
                    this.stage.addEventListener(CEFKeyboardEvent_1.CEFKeyboardEvent.KEY_UP, this.abortPlayBack);
                    this.stage.addEventListener(CEFMouseEvent_6.CEFMouseEvent.CLICK, this.abortPlayBack2);
                }
            }
            else if (pbSource[0].version == "2") {
                this.gLogR.normalizePlayBack();
                CEFDoc_3.CEFDoc.gApp.connectFrameCounter(false);
                addEventListener(CEFEvent_8.CEFEvent.ENTER_FRAME, this.playBackByFrame);
            }
        };
        CEFTutorRoot.prototype.replayStream = function (evt) {
            if (this.traceMode)
                CUtil_22.CUtil.trace("\t*** Start - Replay Stream ***");
            this.cCursor.initWOZCursor(CEFCursorProxy_1.CEFCursorProxy.WOZREPLAY);
            this.cCursor.show(true);
            this.cCursor.initPlayBack();
            this.restoreDefState(this.tutorAutoObj);
            this.stateStack.push(this.baseTime);
            this.stateStack.push(CEFDoc_3.CEFDoc.gApp.stateID);
            this.stateStack.push(CEFDoc_3.CEFDoc.gApp.frameID);
            this.stateStack.push(this.gLogR.fLogging);
            this.gLogR.fLogging = CLogManagerType_1.CLogManagerType.RECLOGNONE;
            this.gLogR.setPlayBackSource(null);
            this.gLogR.normalizePlayBack();
            CEFDoc_3.CEFDoc.gApp.connectFrameCounter(false);
            this.SnavPanel.goToScene("Sscene0");
            addEventListener(CEFEvent_8.CEFEvent.ENTER_FRAME, this.playBackByFrame);
        };
        CEFTutorRoot.prototype.replayLiveStream = function () {
            if (this.traceMode)
                CUtil_22.CUtil.trace("\t*** Start - Replay Live Stream ***");
            this.cCursor.initWOZCursor(CEFCursorProxy_1.CEFCursorProxy.WOZREPLAY);
            this.cCursor.setCursorStyle("Sautomate");
            this.cCursor.setTopMost();
            this.cCursor.show(true);
            this.cCursor.initPlayBack();
            this.restoreDefState(this.tutorAutoObj);
            this.stateStack.push(this.baseTime);
            this.stateStack.push(CEFDoc_3.CEFDoc.gApp.stateID);
            this.stateStack.push(CEFDoc_3.CEFDoc.gApp.frameID);
            this.stateStack.push(this.gLogR.fLogging);
            this.gLogR.fLogging = CLogManagerType_1.CLogManagerType.RECLOGNONE;
            this.gLogR.setPlayBackSource(null);
            this.gLogR.normalizePlayBack();
            CEFDoc_3.CEFDoc.gApp.connectFrameCounter(false);
            this.SnavPanel.goToScene("SstartSplash");
            addEventListener(CEFEvent_8.CEFEvent.ENTER_FRAME, this.playBackByFrame);
        };
        CEFTutorRoot.prototype.abortPlayBack = function (evt) {
            this.gLogR.setPlayBackDone(true);
            dispatchEvent(new Event("interruptPlayBack"));
        };
        CEFTutorRoot.prototype.abortPlayBack2 = function (evt) {
            this.gLogR.setPlayBackDone(true);
            dispatchEvent(new Event("interruptPlayBack"));
        };
        CEFTutorRoot.prototype.playBackByFrame = function (evt) {
            var wozEvt = null;
            var nextEventState;
            if (this.gLogR.playBackDone()) {
                if (this.traceMode)
                    CUtil_22.CUtil.trace("-- Playback Completed -- ");
                removeEventListener(CEFEvent_8.CEFEvent.ENTER_FRAME, this.playBackByFrame);
                this.cCursor.initWOZCursor(CEFCursorProxy_1.CEFCursorProxy.WOZLIVE);
                this.cCursor.setCursorStyle("Sstandard");
                this.cCursor.show(false);
                dispatchEvent(new Event("endPlayBack"));
                this.gLogR.fLogging = this.stateStack.pop();
                CEFDoc_3.CEFDoc.gApp.frameID = this.stateStack.pop();
                CEFDoc_3.CEFDoc.gApp.stateID = this.stateStack.pop();
                this.baseTime = this.stateStack.pop();
                CEFDoc_3.CEFDoc.gApp.connectFrameCounter(true);
            }
            else {
                nextEventState = this.gLogR.getNextEventState();
                if (this.traceMode)
                    CUtil_22.CUtil.trace("CEFDoc.gApp.stateID: " + CEFDoc_3.CEFDoc.gApp.stateID + "  - nextEventState:" + nextEventState);
                {
                    do {
                        wozEvt = this.gLogR.getNextEvent(CEFDoc_3.CEFDoc.gApp.stateID, CEFDoc_3.CEFDoc.gApp.frameID);
                        if (wozEvt != null) {
                            if (this.traceMode)
                                CUtil_22.CUtil.trace("-- Executing Frame:" + CEFDoc_3.CEFDoc.gApp.frameID + " -- EVT -- " + wozEvt);
                            this.cCursor.playBackAction(wozEvt);
                        }
                    } while (wozEvt != null);
                    CEFDoc_3.CEFDoc.gApp.incFrameID();
                }
            }
        };
        CEFTutorRoot.prototype.playBackByTime = function (evt) {
            var frameTime = CUtil_22.CUtil.getTimer() - this.baseTime;
            var wozEvt;
            do {
                wozEvt = this.gLogR.getActionEvent(frameTime);
                if (wozEvt != null) {
                    this.cCursor.playBackAction(wozEvt);
                    if (this.traceMode)
                        CUtil_22.CUtil.trace("-- Executing Frame:" + frameTime + " -- EVT -- " + wozEvt);
                }
            } while (wozEvt != null);
            wozEvt = this.gLogR.getMoveEvent(frameTime);
            if (wozEvt != null)
                this.cCursor.playBackMove(wozEvt, frameTime);
            if (this.gLogR.playBackDone()) {
                if (this.traceMode)
                    CUtil_22.CUtil.trace("-- Playback Completed -- ");
                removeEventListener(CEFEvent_8.CEFEvent.ENTER_FRAME, this.playBackByTime);
                this.cCursor.initWOZCursor(CEFCursorProxy_1.CEFCursorProxy.WOZLIVE);
                this.cCursor.setCursorStyle("Sstandard");
                this.cCursor.show(false);
                dispatchEvent(new Event("endPlayBack"));
                this.gLogR.fLogging = this.stateStack.pop();
                CEFDoc_3.CEFDoc.gApp.frameID = this.stateStack.pop();
                CEFDoc_3.CEFDoc.gApp.stateID = this.stateStack.pop();
                this.baseTime = this.stateStack.pop();
                CEFDoc_3.CEFDoc.gApp.connectFrameCounter(true);
                if (CEFTutorRoot.fDemo) {
                    this.stage.removeEventListener(CEFKeyboardEvent_1.CEFKeyboardEvent.KEY_UP, this.abortPlayBack);
                    this.stage.removeEventListener(CEFMouseEvent_6.CEFMouseEvent.CLICK, this.abortPlayBack2);
                }
            }
        };
        CEFTutorRoot.prototype.dumpScenes = function (Tutor) {
            for (var scene in Tutor) {
                if (this.traceMode)
                    CUtil_22.CUtil.trace("\tSCENE : " + scene);
                if (scene != "instance" && Tutor[scene].instance instanceof CEFObject_9.CEFObject) {
                    if (this.traceMode)
                        CUtil_22.CUtil.trace("\tCEF***");
                    Tutor[scene].instance.dumpSceneObjs(Tutor[scene]);
                }
            }
        };
        CEFTutorRoot.prototype.enumScenes = function () {
            var sceneObj;
            for (var i1 = 0; i1 < this.numChildren; i1++) {
                sceneObj = this.getChildAt(i1);
                CUtil_22.CUtil.trace(sceneObj.name + " is visible : " + ((sceneObj.visible) ? " true" : " false"));
            }
        };
        CEFTutorRoot.prototype.enumChildren = function (scene, indentCnt) {
            var sceneObj;
            var indent = "";
            for (var i2 = 0; i2 < indentCnt; i2++)
                indent += "\t";
            for (var i1 = 0; i1 < scene.numChildren; i1++) {
                sceneObj = scene.getChildAt(i1);
                CUtil_22.CUtil.trace(indent + sceneObj.name + " is visible : " + ((sceneObj.visible) ? " true" : " false") + " -alpha : " + sceneObj.alpha.toString() + "- x : " + sceneObj.x.toString() + " -y : " + sceneObj.y.toString() + " -width : " + sceneObj.width.toString() + " -height : " + sceneObj.height.toString());
                if (sceneObj instanceof DisplayObjectContainer)
                    this.enumChildren(sceneObj, indentCnt + 1);
            }
        };
        CEFTutorRoot.prototype.showNext = function (fshow) {
            this.SnavPanel.SnextButton.showButton(fshow);
        };
        CEFTutorRoot.prototype.enableNext = function (fEnable) {
            this.SnavPanel.SnextButton.enableButton(fEnable);
        };
        CEFTutorRoot.prototype.enableBack = function (fEnable) {
            this.SnavPanel.SbackButton.enableButton(fEnable);
        };
        CEFTutorRoot.prototype.questionStart = function (evt) {
            if (this.traceMode)
                CUtil_22.CUtil.trace("Start of Question: ");
        };
        CEFTutorRoot.prototype.questionComplete = function (evt) {
            if (this.traceMode)
                CUtil_22.CUtil.trace("Question Complete: ");
        };
        CEFTutorRoot.prototype.goBackScene = function (evt) {
            if (this.traceMode)
                CUtil_22.CUtil.trace("Force Decrement Question: ");
            this.SnavPanel.onButtonPrev(null);
        };
        CEFTutorRoot.prototype.goNextScene = function (evt) {
            if (this.traceMode)
                CUtil_22.CUtil.trace("Force Increment Question: ");
            this.SnavPanel.gotoNextScene();
        };
        CEFTutorRoot.prototype.goToScene = function (evt) {
            if (this.traceMode)
                CUtil_22.CUtil.trace("Force Increment Question: ");
            this.SnavPanel.goToScene(evt.wozNavTarget);
        };
        return CEFTutorRoot;
    }(CEFRoot_15.CEFRoot));
    exports.CEFTutorRoot = CEFTutorRoot;
});
define("network/ILogManager", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("core/CEFObjectDyno", ["require", "exports", "core/CEFRoot", "core/CEFObject", "util/CUtil"], function (require, exports, CEFRoot_16, CEFObject_10, CUtil_23) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFObjectDyno = (function (_super) {
        __extends(CEFObjectDyno, _super);
        function CEFObjectDyno() {
            return _super.call(this) || this;
        }
        CEFObjectDyno.prototype.initAutomation = function (_parentScene, sceneObj, ObjIdRef, lLogger, lTutor) {
            if (this.traceMode)
                CUtil_23.CUtil.trace("CEFObjectDyno initAutomation:");
            var subObj;
            var wozObj;
            this.objID = ObjIdRef + name;
            for (var i1 = 0; i1 < this.numChildren; i1++) {
                subObj = this.getChildAt(i1);
                if (subObj instanceof CEFObject_10.CEFObject || subObj instanceof CEFObjectDyno) {
                    subObj.parentScene = _parentScene;
                }
            }
        };
        return CEFObjectDyno;
    }(CEFRoot_16.CEFRoot));
    exports.CEFObjectDyno = CEFObjectDyno;
});
define("core/CEFObject", ["require", "exports", "core/CEFRoot", "core/CEFObjectDyno", "core/CEFAnimator", "events/CEFEvent", "util/CUtil"], function (require, exports, CEFRoot_17, CEFObjectDyno_1, CEFAnimator_2, CEFEvent_9, CUtil_24) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Tween = createjs.Tween;
    var ColorMatrixFilter = createjs.ColorMatrixFilter;
    var BlurFilter = createjs.BlurFilter;
    var Ease = createjs.Ease;
    var CEFObject = (function (_super) {
        __extends(CEFObject, _super);
        function CEFObject() {
            var _this = _super.call(this) || this;
            _this.sAuto = "UNKNOWN";
            _this.satFrames = 8;
            _this.satIncrement = 1 / _this.satFrames;
            _this.curSat = 1.0;
            _this.curBlur = 1.0;
            _this.blurFrames = 8;
            _this.blurIncrement = 1 / _this.blurFrames;
            _this.curGlow = 1.0;
            _this.glowFrames = 8;
            _this.glowIncrement = 1 / _this.glowFrames;
            _this._isvalid = "false";
            _this._ischecked = "false";
            _this._activeFeature = "";
            _this._validFeature = "";
            _this._invalidFeature = "";
            _this._sceneData = new Object;
            _this._phaseData = new Object;
            _this._hasClickMask = false;
            _this._hidden = false;
            _this.onCreateScript = null;
            _this.onExitScript = null;
            _this.traceMode = false;
            if (_this.traceMode)
                CUtil_24.CUtil.trace("CEFObject:Constructor");
            _this.tweenID = 1;
            _this.bTweenable = true;
            _this.bSubTweenable = false;
            _this.bPersist = false;
            return _this;
        }
        CEFObject.prototype.onCreate = function () {
            if ((CEFRoot_17.CEFRoot.gSceneConfig != null) && (CEFRoot_17.CEFRoot.gSceneConfig.objectdata[name] != undefined))
                this.parseOBJ(this, CEFRoot_17.CEFRoot.gSceneConfig.objectdata[name].children(), name);
            if (this.onCreateScript != null)
                this.doCreateAction();
        };
        CEFObject.prototype.doCreateAction = function () {
            try {
                eval(this.onCreateScript);
            }
            catch (e) {
                CUtil_24.CUtil.trace("Error in onCreate script: " + this.onCreateScript);
            }
        };
        CEFObject.prototype.doExitAction = function () {
            if (this.onExitScript != null) {
                try {
                    eval(this.onExitScript);
                }
                catch (e) {
                    CUtil_24.CUtil.trace("Error in onExit script: " + this.onExitScript);
                }
            }
        };
        CEFObject.prototype.incFrameNdx = function () {
            CEFObject._framendx++;
        };
        Object.defineProperty(CEFObject.prototype, "hidden", {
            get: function () {
                return this._hidden;
            },
            set: function (hide) {
                this._hidden = hide;
                if (this._hidden) {
                    this.visible = false;
                    this.alpha = 0;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFObject.prototype, "features", {
            get: function () {
                return this._features;
            },
            set: function (newFTR) {
                this._features = newFTR;
            },
            enumerable: true,
            configurable: true
        });
        CEFObject.prototype.setANDFeature = function (newFTR) {
            if (this._features.length != 0)
                this._features += ",";
            this._features += newFTR;
        };
        CEFObject.prototype.setORFeature = function (newFTR) {
            if (this._features.length != 0)
                this._features += ":";
            this._features += newFTR;
        };
        CEFObject.prototype.unSetFeature = function (ftr) {
            var feature;
            var featArray = new Array;
            var updatedFTRset = "";
            if (this._features.length > 0)
                featArray = this._features.split(":");
            for (var _i = 0, featArray_3 = featArray; _i < featArray_3.length; _i++) {
                var feature_5 = featArray_3[_i];
                if (feature_5 != ftr) {
                    if (updatedFTRset.length != 0)
                        updatedFTRset += ":";
                    updatedFTRset += ftr;
                }
            }
            this._features = updatedFTRset;
        };
        CEFObject.prototype.buildObject = function (objectClass, objectName) {
            var newObject;
            var maskDim;
            var ClassRef = this.getDefinitionByName(objectClass);
            newObject = new ClassRef();
            newObject.name = objectName;
            newObject.onCreate();
            this.addChild(newObject);
            if (newObject._hasClickMask) {
                maskDim = newObject.globalToLocal(0, 0);
                newObject.SclickMask.x = maskDim.x;
                newObject.SclickMask.y = maskDim.y;
                newObject.SclickMask.graphics.setStrokeStyle(0);
                newObject.SclickMask.graphics.beginFill(newObject._maskColor);
                newObject.SclickMask.graphics.drawRect(0, 0, CEFObject.STAGEWIDTH, CEFObject.STAGEHEIGHT);
                newObject.SclickMask.graphics.endFill();
            }
            return newObject;
        };
        CEFObject.prototype.buildMask = function () {
        };
        Object.defineProperty(CEFObject.prototype, "activeFeature", {
            get: function () {
                return "";
            },
            set: function (value) {
            },
            enumerable: true,
            configurable: true
        });
        CEFObject.prototype.clearAllEffects = function (fHide) {
            if (fHide === void 0) { fHide = true; }
            this.stopTransitions();
            removeEventListener(CEFEvent_9.CEFEvent.ENTER_FRAME, this.saturationTimer);
            removeEventListener(CEFEvent_9.CEFEvent.ENTER_FRAME, this.blurTimer);
            removeEventListener(CEFEvent_9.CEFEvent.ENTER_FRAME, this.flashTimer);
            this.filters = null;
            if (fHide)
                this.alpha = 0;
        };
        CEFObject.prototype.moveChild = function (tarObj, moveX, moveY, duration) {
            if (duration === void 0) { duration = "0.5"; }
            if (moveX != "")
                this.Running.push(new Tween(this[tarObj]).to({ x: moveX }, Number(duration), Ease.cubicInOut));
            if (moveY != "")
                this.Running.push(new Tween(this[tarObj]).to({ y: moveY }, Number(duration), Ease.cubicInOut));
        };
        CEFObject.prototype.moveOriginChild = function (tarObj, regx, regy, duration) {
            if (duration === void 0) { duration = "0.5"; }
            if (regx != "")
                this.Running.push(new Tween(this[tarObj]).to({ regX: regx }, Number(duration), Ease.cubicInOut));
            if (regy != "")
                this.Running.push(new Tween(this[tarObj]).to({ regY: regy }, Number(duration), Ease.cubicInOut));
        };
        CEFObject.prototype.scaleChild = function (tarObj, scalex, scaley, duration) {
            if (duration === void 0) { duration = "0.5"; }
            if (scalex != "")
                this.Running.push(new Tween(this[tarObj]).to({ scaleX: scalex }, Number(duration), Ease.cubicInOut));
            if (scaley != "")
                this.Running.push(new Tween(this[tarObj]).to({ scaleY: scaley }, Number(duration), Ease.cubicInOut));
        };
        CEFObject.prototype.saturateChild = function (tarObj, newState, duration) {
            if (duration === void 0) { duration = "0.08"; }
            this[tarObj].saturateObj(newState, duration);
        };
        CEFObject.prototype.saturateChildTo = function (tarObj, newSat, duration) {
            if (duration === void 0) { duration = "0.08"; }
            this[tarObj].saturateObjTo(newSat, duration);
        };
        CEFObject.prototype.saturateObj = function (newState, duration) {
            if (duration === void 0) { duration = "0.08"; }
            this.newSaturation = newState;
            if (this.newSaturation == "mono") {
                this.curSat = 1.0;
                this.newSat = 0.0;
            }
            else {
                this.curSat = 0.0;
                this.newSat = 1.0;
            }
            this.satIncrement = 1.0 / 12;
            addEventListener(CEFEvent_9.CEFEvent.ENTER_FRAME, this.saturationTimer);
        };
        CEFObject.prototype.saturateObjTo = function (_newSat, duration) {
            if (duration === void 0) { duration = "0.08"; }
            var dynRange;
            if (_newSat > this.curSat) {
                this.newSaturation = "color";
            }
            else {
                this.newSaturation = "mono";
            }
            this.newSat = _newSat;
            dynRange = Math.abs(_newSat - this.curSat);
            this.satIncrement = dynRange / 12;
            addEventListener(CEFEvent_9.CEFEvent.ENTER_FRAME, this.saturationTimer);
        };
        CEFObject.prototype.saturationTimer = function (evt) {
            if (this.newSaturation == "color") {
                this.curSat += this.satIncrement;
                if (this.curSat >= this.newSat) {
                    this.curSat = this.newSat;
                    removeEventListener(CEFEvent_9.CEFEvent.ENTER_FRAME, this.saturationTimer);
                }
            }
            else if (this.newSaturation == "mono") {
                this.curSat -= this.satIncrement;
                if (this.curSat <= this.newSat) {
                    this.curSat = this.newSat;
                    removeEventListener(CEFEvent_9.CEFEvent.ENTER_FRAME, this.saturationTimer);
                }
            }
            else {
                this.curSat = 1.0;
                removeEventListener(CEFEvent_9.CEFEvent.ENTER_FRAME, this.saturationTimer);
            }
            this.filters = new Array(this.adjustSaturation(Number(this.curSat)));
        };
        CEFObject.prototype.adjustSaturation = function (s) {
            if (s === void 0) { s = 1; }
            var sInv;
            var irlum;
            var iglum;
            var iblum;
            sInv = (1 - s);
            irlum = (sInv * CEFObject.LUMA_R);
            iglum = (sInv * CEFObject.LUMA_G);
            iblum = (sInv * CEFObject.LUMA_B);
            return new ColorMatrixFilter([(irlum + s), iglum, iblum, 0, 0,
                irlum, (iglum + s), iblum, 0, 0,
                irlum, iglum, (iblum + s), 0, 0,
                0, 0, 0, 1, 0]);
        };
        CEFObject.prototype.blurChild = function (tarObj, duration) {
            if (duration === void 0) { duration = "12"; }
            this[tarObj].blurObj(duration);
        };
        CEFObject.prototype.blurObj = function (duration) {
            if (duration === void 0) { duration = "12"; }
            this.blurIncrement = 255.0 / Number(duration);
            this.curBlur = 0;
            addEventListener(CEFEvent_9.CEFEvent.ENTER_FRAME, this.blurTimer);
        };
        CEFObject.prototype.blurTimer = function (evt) {
            this.curBlur += this.blurIncrement;
            if (this.curBlur >= 255) {
                removeEventListener(CEFEvent_9.CEFEvent.ENTER_FRAME, this.blurTimer);
                dispatchEvent(new Event("blur_complete"));
                this.filters = null;
                this.alpha = 0;
            }
            else
                this.filters = new Array(new BlurFilter(this.curBlur, this.curBlur));
        };
        CEFObject.prototype.flashChild = function (tarObj, _glowColor, duration) {
            if (duration === void 0) { duration = "8"; }
            this[tarObj].flashObj(_glowColor, duration);
        };
        CEFObject.prototype.flashObj = function (_glowColor, duration) {
            if (duration === void 0) { duration = "8"; }
            this.glowStage = "color";
            this.glowColor = _glowColor;
            this.glowStrength = 2.0;
            this.glowAlpha = 1.0;
            this.glowIncrement = 175.0 / Number(duration);
            this.curGlow = 0;
            if (this.traceMode)
                CUtil_24.CUtil.trace("start Object Flash");
            addEventListener(CEFEvent_9.CEFEvent.ENTER_FRAME, this.flashTimer);
        };
        CEFObject.prototype.flashTimer = function (evt) {
            if (this.glowStage == "color") {
                this.curGlow += this.glowIncrement;
                this.glowStrength += .1;
                if (this.curGlow >= 175) {
                    this.glowStage = "alpha";
                }
            }
            else if (this.glowStage == "alpha") {
                if (this.glowAlpha <= 0.0) {
                    if (this.traceMode)
                        CUtil_24.CUtil.trace("end Object Flash");
                    removeEventListener(CEFEvent_9.CEFEvent.ENTER_FRAME, this.flashTimer);
                    dispatchEvent(new Event("glow_complete"));
                    this.glowStage = "done";
                    this.filters = null;
                }
                this.glowAlpha -= .05;
            }
        };
        CEFObject.prototype.showChild = function (tarObj, alphaTo, autoStart) {
            if (alphaTo === void 0) { alphaTo = -1; }
            if (autoStart === void 0) { autoStart = false; }
            this[tarObj].visible = true;
            if (alphaTo != -1)
                this[tarObj].alpha = alphaTo;
        };
        CEFObject.prototype.hideChild = function (tarObj) {
            this[tarObj].visible = false;
        };
        CEFObject.prototype.fadeChildOff = function (tarObj, autoStart, duration) {
            if (autoStart === void 0) { autoStart = false; }
            if (duration === void 0) { duration = "0.5"; }
            this._tarObj = tarObj;
            this.Running.push(new Tween(this[tarObj]).to({ alpha: 0 }, Number(duration), Ease.cubicInOut));
            if (autoStart)
                this.startTransition(this.hideDone);
        };
        CEFObject.prototype.hideDone = function () {
            this[this._tarObj].visible = false;
        };
        CEFObject.prototype.fadeChild = function (tarObj, alphaTo, autoStart, duration) {
            if (autoStart === void 0) { autoStart = false; }
            if (duration === void 0) { duration = "0.5"; }
            this[tarObj].visible = true;
            switch (alphaTo) {
                case "off":
                case "on":
                    if (this.traceMode)
                        CUtil_24.CUtil.trace("Fading : ", tarObj, alphaTo);
                    this.Running.push(new Tween(this[tarObj]).to({ alpha: (alphaTo == "on") ? 1 : 0 }, Number(duration), Ease.cubicInOut));
                    if (autoStart == true)
                        this.startTransition(this.twnDone);
                    break;
                default:
                    if (this.traceMode)
                        CUtil_24.CUtil.trace("fadeChild: Parameter error - should be 'on' or 'off' - is: ", alphaTo);
                    break;
            }
        };
        CEFObject.prototype.fadeChildTo = function (tarObj, alphaTo, autoStart, duration) {
            if (autoStart === void 0) { autoStart = false; }
            if (duration === void 0) { duration = "0.5"; }
            this[tarObj].visible = true;
            if (this.traceMode)
                CUtil_24.CUtil.trace("Fading To: ", tarObj, alphaTo);
            this.Running.push(new Tween(this[tarObj]).to({ alpha: alphaTo }, Number(duration), Ease.cubicInOut));
            if (autoStart == true)
                this.startTransition(this.twnDone);
        };
        CEFObject.prototype.twnDone = function () {
        };
        CEFObject.prototype.startTween = function (xnF) {
            if (xnF === void 0) { xnF = this.twnDone; }
            if (this.Running.length > 0)
                this.startTransition((xnF == null) ? this.twnDone : xnF);
        };
        CEFObject.prototype.deepStateCopy = function (src) {
            this.rotation = src.rotation;
            this.x = src.x;
            this.y = src.y;
            this.scaleX = src.scaleX;
            this.scaleY = src.scaleY;
            this.alpha = src.alpha;
            this.visible = src.visible;
            this.bPersist = src.bPersist;
            this.activeFeature = src.activeFeature;
        };
        CEFObject.prototype.shallowStateCopy = function (tar, src) {
            tar.rotation = src.rotation;
            tar.x = src.x;
            tar.y = src.y;
            tar.scaleX = src.scaleX;
            tar.scaleY = src.scaleY;
            tar.alpha = src.alpha;
            tar.visible = src.visible;
        };
        CEFObject.prototype.captureDefState = function (tutObject) {
            this.defRot = this.rotation;
            this.defX = this.x;
            this.defY = this.y;
            this.defWidth = this.scaleX;
            this.defHeight = this.scaleY;
            this.defAlpha = this.alpha;
            for (var subObject in tutObject) {
                if (subObject != "instance" && tutObject[subObject].instance instanceof CEFObject) {
                    if (this.traceMode)
                        CUtil_24.CUtil.trace("capturing: " + tutObject[subObject].instance.name);
                    tutObject[subObject].instance.captureDefState(tutObject[subObject]);
                }
            }
        };
        CEFObject.prototype.restoreDefState = function (tutObject) {
            this.rotation = this.defRot;
            this.scaleX = this.defWidth;
            this.scaleY = this.defHeight;
            this.x = this.defX;
            this.y = this.defY;
            this.alpha = this.defAlpha;
            for (var subObject in tutObject) {
                if (subObject != "instance" && tutObject[subObject].instance instanceof CEFObject) {
                    if (this.traceMode)
                        CUtil_24.CUtil.trace("restoring: " + tutObject[subObject].instance.name);
                    tutObject[subObject].instance.restoreDefState(tutObject[subObject]);
                }
            }
        };
        CEFObject.prototype.isTweenable = function () {
            return this.bTweenable;
        };
        CEFObject.prototype.isSubTweenable = function () {
            return this.bSubTweenable;
        };
        CEFObject.prototype.captureLogState = function (obj) {
            if (obj === void 0) { obj = null; }
            if (obj == null)
                obj = new Object;
            return obj;
        };
        CEFObject.prototype.captureXMLState = function () {
            var nullXML = '<null/>';
            return nullXML;
        };
        CEFObject.prototype.restoreXMLState = function (xmlState) {
        };
        CEFObject.prototype.compareXMLState = function (xmlState) {
            return false;
        };
        CEFObject.prototype.createLogAttr = function (objprop, restart) {
            if (restart === void 0) { restart = false; }
            var sResult;
            if (!this.hasOwnProperty(objprop))
                sResult = "undefined";
            else
                sResult = this[objprop];
            return sResult;
        };
        CEFObject.prototype.measure = function () {
        };
        CEFObject.prototype.initAutomation = function (_parentScene, sceneObj, ObjIdRef, lLogger, lTutor) {
            if (this.traceMode)
                CUtil_24.CUtil.trace("CEFObject initAutomation:");
            var subObj;
            var wozObj;
            this.objID = ObjIdRef + name;
            for (var i1 = 0; i1 < this.numChildren; i1++) {
                subObj = this.getChildAt(i1);
                sceneObj[subObj.name] = new Object;
                sceneObj[subObj.name].instance = subObj;
                if (subObj instanceof CEFObject || subObj instanceof CEFObjectDyno_1.CEFObjectDyno) {
                    subObj.parentScene = _parentScene;
                    if (subObj instanceof CEFObject)
                        subObj.measure();
                }
                sceneObj[subObj.name]['inPlace'] = { X: subObj.x, Y: subObj.y, Width: subObj.scaleX, Height: subObj.scaleY, Alpha: subObj.alpha };
                if (this.traceMode)
                    CUtil_24.CUtil.trace("\t\tCEFObject found subObject named:" + subObj.name);
                if (subObj instanceof CEFObject) {
                    wozObj = subObj;
                    wozObj.initAutomation(_parentScene, sceneObj[subObj.name], this.objID + ".", lLogger, lTutor);
                }
                if (subObj instanceof CEFObjectDyno_1.CEFObjectDyno) {
                    var wozDynoObj = subObj;
                    wozDynoObj.initAutomation(_parentScene, sceneObj[subObj.name], this.objID + ".", lLogger, lTutor);
                }
            }
        };
        CEFObject.prototype.setAutomationMode = function (sceneObj, sMode) {
            this.sAuto = sMode;
            for (var subObj in sceneObj) {
                if (subObj != "instance" && sceneObj[subObj].instance instanceof CEFObject) {
                    sceneObj[subObj].instance.setAutomationMode(sceneObj[subObj], sMode);
                }
            }
        };
        CEFObject.prototype.dumpSubObjs = function (sceneObj, Indent) {
            for (var subObj in sceneObj) {
                if (this.traceMode)
                    CUtil_24.CUtil.trace(Indent + "\tsubObj : " + subObj);
                if (subObj != "instance") {
                    var ObjData = sceneObj[subObj];
                    if (sceneObj[subObj].instance instanceof CEFObject) {
                        if (this.traceMode)
                            CUtil_24.CUtil.trace(Indent + "\t");
                        var wozObj = sceneObj[subObj].instance;
                        if (ObjData['inPlace'] != undefined) {
                            if (this.traceMode)
                                CUtil_24.CUtil.trace(Indent + "\tCEF* Object: " + " x: " + wozObj.x + " y: " + wozObj.y + " width: " + wozObj.scaleX + " height: " + wozObj.scaleY + " alpha: " + wozObj.alpha + " visible: " + wozObj.visible + " name: " + wozObj.name);
                            if (this.traceMode)
                                CUtil_24.CUtil.trace(Indent + "\tIn-Place Pos: " + " X: " + ObjData['inPlace'].X + " Y: " + ObjData['inPlace'].Y + " Width: " + ObjData['inPlace'].scaleX + " Height: " + ObjData['inPlace'].scaleY + " Alpha: " + ObjData['inPlace'].Alpha);
                        }
                        sceneObj[subObj].instance.dumpSubObjs(sceneObj[subObj], Indent + "\t");
                    }
                    else {
                        var disObj = sceneObj[subObj].instance;
                        if (ObjData['inPlace'] != undefined) {
                            if (this.traceMode)
                                CUtil_24.CUtil.trace(Indent + "\tFlash Object: " + " x: " + disObj.x + " y: " + disObj.y + " width: " + disObj.scaleX + " height: " + disObj.scaleY + " alpha: " + disObj.alpha + " visible: " + disObj.visible + " name: " + disObj.name);
                            if (this.traceMode)
                                CUtil_24.CUtil.trace(Indent + "\tIn-Place Pos: " + " X: " + ObjData['inPlace'].X + " Y: " + ObjData['inPlace'].Y + " Width: " + ObjData['inPlace'].scaleX + " Height: " + ObjData['inPlace'].scaleY + " Alpha: " + ObjData['inPlace'].Alpha);
                        }
                    }
                }
                else {
                    if (this.traceMode)
                        CUtil_24.CUtil.trace(Indent + "Parent Object : " + sceneObj + " visible: " + sceneObj[subObj].visible);
                }
            }
        };
        Object.defineProperty(CEFObject.prototype, "isChecked", {
            get: function () {
                return this._ischecked;
            },
            set: function (sval) {
                this._ischecked = sval;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFObject.prototype, "checked", {
            get: function () {
                return (this._ischecked == "true") ? true : false;
            },
            set: function (bval) {
                this._ischecked = (bval) ? "true" : "false";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFObject.prototype, "isValid", {
            get: function () {
                return this._isvalid;
            },
            set: function (sval) {
                this._isvalid = sval;
            },
            enumerable: true,
            configurable: true
        });
        CEFObject.prototype.assertFeatures = function () {
            return "";
        };
        CEFObject.prototype.retractFeatures = function () {
        };
        Object.defineProperty(CEFObject.prototype, "tallyValid", {
            get: function () {
                return "0";
            },
            enumerable: true,
            configurable: true
        });
        CEFObject.prototype.assertFeature = function (_feature) {
            if (_feature != "")
                CEFRoot_17.CEFRoot.gTutor.addFeature = _feature;
        };
        CEFObject.prototype.retractFeature = function (_feature) {
            if (_feature != "")
                CEFRoot_17.CEFRoot.gTutor.delFeature = _feature;
        };
        CEFObject.initGlobals = function () {
            CEFObject._globals = new Object;
        };
        CEFObject.prototype.incrGlobal = function (_id, _max, _cycle) {
            if (_max === void 0) { _max = -1; }
            if (_cycle === void 0) { _cycle = 0; }
            var result;
            if (CEFObject._globals.hasOwnProperty(_id)) {
                CEFObject._globals[_id]++;
                result = CEFObject._globals[_id];
                if (CEFObject._globals[_id] == _max)
                    CEFObject._globals[_id] = _cycle;
            }
            else
                result = CEFObject._globals[_id] = 1;
            return result;
        };
        CEFObject.prototype.assertGlobal = function (_id, _value) {
            CEFObject._globals[_id] = _value;
        };
        CEFObject.prototype.retractGlobal = function (_id) {
            CEFObject._globals[_id] = "";
        };
        CEFObject.prototype.queryGlobal = function (_id) {
            var result;
            if (CEFObject._globals.hasOwnProperty(_id)) {
                result = CEFObject._globals[_id];
            }
            else
                result = "null";
            return result;
        };
        Object.defineProperty(CEFObject.prototype, "globals", {
            get: function () {
                return CEFObject._globals;
            },
            set: function (gval) {
                CEFObject._globals = gval;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFObject.prototype, "valid", {
            get: function () {
                return (this._isvalid == "true") ? true : false;
            },
            set: function (bval) {
                this._isvalid = (bval) ? "true" : "false";
            },
            enumerable: true,
            configurable: true
        });
        CEFObject.prototype.wozMouseClick = function (evt) {
            this.dispatchEvent(evt);
        };
        CEFObject.prototype.wozMouseMove = function (evt) {
            this.dispatchEvent(evt);
        };
        CEFObject.prototype.wozMouseDown = function (evt) {
            this.dispatchEvent(evt);
        };
        CEFObject.prototype.wozMouseUp = function (evt) {
            this.dispatchEvent(evt);
        };
        CEFObject.prototype.wozMouseOver = function (evt) {
            this.dispatchEvent(evt);
        };
        CEFObject.prototype.wozMouseOut = function (evt) {
            this.dispatchEvent(evt);
        };
        CEFObject.prototype.wozKeyDown = function (evt) {
            this.dispatchEvent(evt);
        };
        CEFObject.prototype.wozKeyUp = function (evt) {
            this.dispatchEvent(evt);
        };
        CEFObject.prototype.decodeTarget = function (baseObj, objArray) {
            var tmpObject = baseObj;
            var subObject;
            subObject = objArray.shift();
            if (this.traceMode)
                CUtil_24.CUtil.trace("decoding: " + subObject);
            if (subObject != "this") {
                tmpObject = baseObj[subObject];
                if (objArray.length)
                    tmpObject = this.decodeTarget(tmpObject, objArray);
            }
            return tmpObject;
        };
        CEFObject.prototype.parseOBJLog = function (tarObj, element) {
            var objArray;
            var dataStr;
            var attrName;
            if (this.traceMode)
                CUtil_24.CUtil.trace("Processing: " + element.localName() + " - named: " + element.named);
            objArray = element.objname.split(".");
            if (this.traceMode)
                CUtil_24.CUtil.trace("Target Array: " + objArray[0]);
            if (objArray.length)
                tarObj = this.decodeTarget(tarObj, objArray);
            if (element.objprop != undefined) {
                dataStr = tarObj.createLogAttr(element.objprop);
            }
            else if (element.objmethod != undefined) {
                dataStr = tarObj.runXMLFunction(tarObj, element);
            }
            attrName = this.constructLogName(element.logattr);
            this.navigator._phaseData[attrName] = new Object;
            this.navigator._phaseData[attrName]['value'] = dataStr;
            this.navigator._phaseData[attrName]["start"] = CEFRoot_17.CEFRoot.gTutor.timeStamp.getStartTime("dur_" + name);
            this.navigator._phaseData[attrName]["duration"] = CEFRoot_17.CEFRoot.gTutor.timeStamp.createLogAttr("dur_" + name);
            this._sceneData[element.logattr] = dataStr;
            this._sceneData['phasename'] = element.logid.toString();
            try {
                this._sceneData['Rule0'] = CEFRoot_17.CEFRoot.gTutor.ktSkills['rule0'].queryBelief();
                this._sceneData['Rule1'] = CEFRoot_17.CEFRoot.gTutor.ktSkills['rule1'].queryBelief();
                this._sceneData['Rule2'] = CEFRoot_17.CEFRoot.gTutor.ktSkills['rule2'].queryBelief();
            }
            catch (err) {
                CUtil_24.CUtil.trace("Error - CVS Skills not defined:" + err);
            }
            return;
        };
        CEFObject.prototype.constructLogName = function (attr) {
            var attrName = "L00000";
            var frame;
            frame = CEFObject._framendx.toString();
            attrName = name + "_" + attr + "_" + CEFRoot_17.CEFRoot.gTutor.gNavigator.iteration.toString();
            return attrName;
        };
        CEFObject.prototype.setXMLProperty = function (tarObj, tarXML) {
            if (this.traceMode)
                CUtil_24.CUtil.trace("Processing: " + tarXML.localName() + " - named: " + tarXML.named + "- value: " + tarXML.value);
            if (tarObj.hasOwnProperty(tarXML.prop)) {
                var parmDef = tarXML.value.split(":");
                if (parmDef[1] != "null") {
                    if (parmDef[1] == "Array") {
                        tarObj[tarXML.prop] = parmDef[0].split(",");
                    }
                    else {
                        var tClass = this.getDefinitionByName(parmDef[1]);
                        var value = parmDef[0];
                        tarObj[tarXML.prop] = new tClass(value);
                    }
                }
                else
                    tarObj[tarXML.prop] = null;
            }
        };
        CEFObject.prototype.runXMLFunction = function (tarObj, tarXML) {
            var i1 = 1;
            var tClass;
            var value;
            var objArray;
            var parmDef;
            var parms = new Array;
            while (tarXML["parm" + i1] != undefined) {
                parmDef = tarXML["parm" + i1].split(":");
                if (parmDef[1] == "symbol") {
                    objArray = parmDef[0].split(".");
                    if (objArray.length)
                        parms.push(this.decodeTarget(tarObj, objArray));
                }
                else if (parmDef[1] != "null") {
                    tClass = this.getDefinitionByName(parmDef[1]);
                    value = parmDef[0];
                    parms.push(new tClass(value));
                }
                else
                    parms.push(null);
                i1++;
            }
            if (tarXML.cmnd != undefined)
                return tarObj[tarXML.cmnd].apply(tarObj, (parms));
            if (tarXML.objmethod != undefined)
                return tarObj[tarXML.objmethod].apply(tarObj, (parms));
        };
        CEFObject.prototype.parseOBJ = function (tarObj, tarXML, xType) {
            var tarObject;
            var childList;
            var objArray;
            var element;
            if (this.traceMode)
                CUtil_24.CUtil.trace("Parsing:" + tarXML[0].localName() + " - named: " + tarXML[0].named + " - Count: " + tarXML.length());
            for (var _i = 0, tarXML_2 = tarXML; _i < tarXML_2.length; _i++) {
                element = tarXML_2[_i];
                tarObject = tarObj;
                if (element.features != undefined) {
                    if (!CEFRoot_17.CEFRoot.gTutor.testFeatureSet(String(element.features)))
                        continue;
                }
                try {
                    switch (element.localName()) {
                        case "common":
                            this.parseOBJ(tarObj, CEFObject.gSceneConfig.scenedata[element.text()][xType].children(), xType);
                            break;
                        case "log":
                            this.parseOBJLog(tarObject, element);
                            break;
                        case "obj":
                            if (this.traceMode)
                                CUtil_24.CUtil.trace("Processing: " + element.localName() + " - named: " + element.named);
                            try {
                                objArray = element.named.split(".");
                                if (this.traceMode)
                                    CUtil_24.CUtil.trace("Target Array: " + objArray[0]);
                                if (objArray.length)
                                    tarObject = this.decodeTarget(tarObject, objArray);
                                childList = element.children();
                                if (childList.length > 0)
                                    this.parseOBJ(tarObject, childList, "obj");
                                if (element.prop != undefined) {
                                    this.setXMLProperty(tarObject, element);
                                }
                                else if (element.cmnd != undefined) {
                                    this.runXMLFunction(tarObject, element);
                                }
                            }
                            catch (err) {
                                if (this.traceMode)
                                    CUtil_24.CUtil.trace("Invalid 'obj' target");
                            }
                            break;
                        case "props":
                            if (this.traceMode)
                                CUtil_24.CUtil.trace("Processing: " + element.localName() + " - named: " + element.named + "- value: " + element.value);
                            this.setXMLProperty(tarObject, element);
                            break;
                        case "cmnds":
                            if (this.traceMode)
                                CUtil_24.CUtil.trace("Processing: " + element.localName() + " - named: " + element.named + "- value: " + element.value);
                            this.runXMLFunction(tarObject, element);
                            break;
                        case "symbol":
                            try {
                                objArray = element.named.split(".");
                                if (this.traceMode)
                                    CUtil_24.CUtil.trace("Target Array: " + objArray[0]);
                                if (objArray.length)
                                    tarObject = this.decodeTarget(tarObject, objArray);
                            }
                            catch (err) {
                                CUtil_24.CUtil.trace("ParseXML Symbol named: " + element.named + " not found.");
                                tarObject = null;
                            }
                            if (tarObject != null) {
                                tarObject.loadXML(element);
                            }
                            break;
                        case "object":
                            if (this.hasOwnProperty(element.named) && (this[element.named] != null))
                                this[element.named].parseXML(this[element.named], CEFObject.gSceneConfig.objectdata[element.named].children(), "object");
                            break;
                        case "initself":
                            this.loadXML(element);
                            break;
                    }
                }
                catch (err) {
                    CUtil_24.CUtil.trace("CEFObject:parseXML: " + err);
                }
            }
        };
        CEFObject.prototype.loadOBJ = function (xmlSrc) {
            this._XMLsrc = xmlSrc;
            if (xmlSrc.wozname != undefined)
                this.wozName = xmlSrc.wozname;
            if (xmlSrc.x != undefined)
                this.x = Number(xmlSrc.x);
            if (xmlSrc.y != undefined)
                this.y = Number(xmlSrc.y);
            if (xmlSrc.visible != undefined) {
                this.visible = (xmlSrc.visible == "true") ? true : false;
            }
            if (xmlSrc.alpha != undefined)
                this.alpha = Number(xmlSrc.alpha);
            if (xmlSrc.mask != undefined) {
                this._hasClickMask = true;
                this.addChildAt(this.SclickMask, 0);
            }
            if (xmlSrc.oncreate != undefined) {
                try {
                }
                catch (err) {
                    CUtil_24.CUtil.trace("Error: onCreateScript Invalid: " + xmlSrc.oncreate);
                }
            }
            if (xmlSrc.onexit != undefined) {
                try {
                }
                catch (err) {
                    CUtil_24.CUtil.trace("Error: onExitScript Invalid: " + xmlSrc.onExitScript);
                }
            }
            _super.prototype.loadXML.call(this, xmlSrc);
        };
        CEFObject.CANCELNAV = "CancelNav";
        CEFObject.OKNAV = "OK";
        CEFObject.LUMA_R = 0.212671;
        CEFObject.LUMA_G = 0.71516;
        CEFObject.LUMA_B = 0.072169;
        CEFObject._globals = new Object;
        CEFObject._framendx = 0;
        return CEFObject;
    }(CEFAnimator_2.CEFAnimator));
    exports.CEFObject = CEFObject;
});
define("events/CEFSeekEvent", ["require", "exports", "util/CUtil"], function (require, exports, CUtil_25) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Event = createjs.Event;
    var CEFSeekEvent = (function (_super) {
        __extends(CEFSeekEvent, _super);
        function CEFSeekEvent(type, SeekSeq, bubbles, cancelable) {
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            var _this = _super.call(this, type, bubbles, cancelable) || this;
            _this.wozSeekSeq = SeekSeq;
            return _this;
        }
        CEFSeekEvent.prototype.clone = function () {
            CUtil_25.CUtil.trace("cloning CEFSeekEvent:");
            return new CEFSeekEvent(this.type, this.wozSeekSeq, this.bubbles, this.cancelable);
        };
        CEFSeekEvent.SEEKFORWARD = "WOZSEEKF";
        CEFSeekEvent.SEEKBACKWARD = "WOZSEEKB";
        return CEFSeekEvent;
    }(Event));
    exports.CEFSeekEvent = CEFSeekEvent;
});
define("core/CEFScene", ["require", "exports", "core/CEFRoot", "core/CEFObject", "util/CUtil"], function (require, exports, CEFRoot_18, CEFObject_11, CUtil_26) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFScene = (function (_super) {
        __extends(CEFScene, _super);
        function CEFScene() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.fComplete = false;
            _this.sceneAttempt = 1;
            return _this;
        }
        CEFScene.prototype.CEFScene = function () {
            this.traceMode = false;
            if (this.traceMode)
                CUtil_26.CUtil.trace("CEFScene:Constructor");
        };
        CEFScene.prototype.onCreate = function () {
            if ((CEFScene.gSceneConfig != null) && (CEFScene.gSceneConfig.scenedata[name].create != undefined))
                this.parseOBJ(this, CEFScene.gSceneConfig.scenedata[name].create.children(), "create");
            if (this.onCreateScript != null)
                this.doCreateAction();
            if ((CEFScene.gSceneConfig != null) && (CEFScene.gSceneConfig.scenedata[name].demoinit != undefined))
                this.parseOBJ(this, CEFScene.gSceneConfig.scenedata[name].demoinit.children(), "demoinit");
        };
        CEFScene.prototype.doCreateAction = function () {
            try {
                eval(this.onCreateScript);
            }
            catch (e) {
                CUtil_26.CUtil.trace("Error in onCreate script: " + this.onCreateScript);
            }
        };
        CEFScene.prototype.doExitAction = function () {
            if (this.onExitScript != null) {
                try {
                    eval(this.onExitScript);
                }
                catch (e) {
                    CUtil_26.CUtil.trace("Error in onExit script: " + this.onExitScript);
                }
            }
        };
        CEFScene.prototype.initUI = function () {
        };
        CEFScene.prototype.effectHandler = function (evt) {
            if (this.traceMode)
                CUtil_26.CUtil.trace("Effect Event: " + evt);
            this[evt.prop1](evt.prop2, evt.prop3, evt.prop4, evt.prop5);
        };
        CEFScene.prototype.scriptHandler = function (evt) {
            var fTest = true;
            if (this.traceMode)
                CUtil_26.CUtil.trace("Effect Event: " + evt);
            if (evt.script.features != undefined) {
                fTest = CEFRoot_18.CEFRoot.gTutor.testFeatureSet(String(evt.script.features));
            }
            if (fTest)
                this.parseOBJ(this, evt.script.children(), "script");
        };
        CEFScene.prototype.logSceneTag = function () {
            return { 'scenetag': this.sceneTag, 'attempt': this.sceneAttempt++ };
        };
        CEFScene.prototype.initAutomation = function (_parentScene, scene, ObjIdRef, lLogger, lTutor) {
            var sceneObj;
            var wozObj;
            var wozRoot;
            this.onCreate();
            for (var i1 = 0; i1 < this.numChildren; i1++) {
                sceneObj = this.getChildAt(i1);
                scene[sceneObj.name] = new Object;
                scene[sceneObj.name].instance = sceneObj;
                if (sceneObj instanceof CEFObject_11.CEFObject) {
                    sceneObj.parentScene = _parentScene;
                    sceneObj.measure();
                }
                if (this.traceMode)
                    CUtil_26.CUtil.trace("\t\tCEFScene found subObject named:" + sceneObj.name + " ... in-place: ");
                if (sceneObj instanceof CEFObject_11.CEFObject) {
                    wozObj = sceneObj;
                    wozObj.initAutomation(_parentScene, scene[sceneObj.name], name + ".", lLogger, lTutor);
                }
                if (this.traceMode)
                    for (var id in scene[sceneObj.name].inPlace) {
                        CUtil_26.CUtil.trace("\t\t\t\t" + id + " : " + scene[sceneObj.name].inPlace[id]);
                    }
            }
        };
        CEFScene.prototype.captureDefState = function (TutScene) {
            if (this.traceMode)
                CUtil_26.CUtil.trace("\t*** Start Capture - Walking Top Level Objects***");
            for (var sceneObj in TutScene) {
                if (sceneObj != "instance" && TutScene[sceneObj].instance instanceof CEFObject_11.CEFObject) {
                    if (this.traceMode)
                        CUtil_26.CUtil.trace("capturing: " + TutScene[sceneObj].instance.name);
                    TutScene[sceneObj].instance.captureDefState(TutScene[sceneObj]);
                }
            }
            if (this.traceMode)
                CUtil_26.CUtil.trace("\t*** End Capture - Walking Top Level Objects***");
        };
        CEFScene.prototype.restoreDefState = function (TutScene) {
            if (this.traceMode)
                CUtil_26.CUtil.trace("\t*** Start Restore - Walking Top Level Objects***");
            for (var sceneObj in TutScene) {
                if (sceneObj != "instance" && TutScene[sceneObj].instance instanceof CEFObject_11.CEFObject) {
                    if (this.traceMode)
                        CUtil_26.CUtil.trace("restoring: " + TutScene[sceneObj].instance.name);
                    TutScene[sceneObj].instance.restoreDefState(TutScene[sceneObj]);
                }
            }
            if (this.traceMode)
                CUtil_26.CUtil.trace("\t*** End Restore - Walking Top Level Objects***");
        };
        CEFScene.prototype.setObjMode = function (TutScene, sMode) {
            if (this.traceMode)
                CUtil_26.CUtil.trace("\t*** Start - Walking Top Level Objects***");
            for (var sceneObj in TutScene) {
                if (sceneObj != "instance" && TutScene[sceneObj].instance instanceof CEFObject_11.CEFObject) {
                    TutScene[sceneObj].instance.setAutomationMode(TutScene[sceneObj], sMode);
                }
            }
            if (this.traceMode)
                CUtil_26.CUtil.trace("\t*** End - Walking Top Level Objects***");
        };
        CEFScene.prototype.dumpSceneObjs = function (TutScene) {
            for (var sceneObj in TutScene) {
                if (this.traceMode)
                    CUtil_26.CUtil.trace("\tSceneObj : " + sceneObj);
                if (sceneObj != "instance" && TutScene[sceneObj].instance instanceof CEFObject_11.CEFObject) {
                    if (this.traceMode)
                        CUtil_26.CUtil.trace("\tCEF***");
                    TutScene[sceneObj].instance.dumpSubObjs(TutScene[sceneObj], "\t");
                }
            }
        };
        CEFScene.prototype.updateNav = function () {
            if (this.traceMode)
                CUtil_26.CUtil.trace("UpdateNavigation: ", name, this.fComplete);
            if (!this.fComplete)
                CEFRoot_18.CEFRoot.gTutor.enableNext(false);
            else
                CEFRoot_18.CEFRoot.gTutor.enableNext(true);
            if (this.gForceBackButton)
                CEFRoot_18.CEFRoot.gTutor.enableBack(CEFRoot_18.CEFRoot.fEnableBack);
        };
        CEFScene.prototype.questionFinished = function (evt) {
            this.fComplete = true;
            this.updateNav();
        };
        CEFScene.prototype.questionComplete = function () {
            return this.fComplete;
        };
        CEFScene.prototype.preEnterScene = function (lTutor, sceneLabel, sceneTitle, scenePage, Direction) {
            if (this.traceMode)
                CUtil_26.CUtil.trace("Default Pre-Enter Scene Behavior: " + sceneTitle);
            lTutor.StitleBar.Stitle.text = sceneTitle;
            lTutor.StitleBar.Spage.text = scenePage;
            this.demoBehavior();
            if ((CEFScene.gSceneConfig != null) && (CEFScene.gSceneConfig.scenedata[name].preenter != undefined))
                this.parseOBJ(this, CEFScene.gSceneConfig.scenedata[name].preenter.children(), "preenter");
            if (this.fComplete)
                this.updateNav();
            this.initUI();
            return sceneLabel;
        };
        CEFScene.prototype.deferredEnterScene = function (Direction) {
        };
        CEFScene.prototype.onEnterScene = function (Direction) {
            if (this.traceMode)
                CUtil_26.CUtil.trace("Default Enter Scene Behavior:");
            if ((CEFScene.gSceneConfig != null) && (CEFScene.gSceneConfig.scenedata[name].onenter != undefined))
                this.parseOBJ(this, CEFScene.gSceneConfig.scenedata[name].onenter.children(), "onenter");
        };
        CEFScene.prototype.preExitScene = function (Direction, sceneCurr) {
            if (this.traceMode)
                CUtil_26.CUtil.trace("Default Pre-Exit Scene Behavior:");
            if ((CEFScene.gSceneConfig != null) && (CEFScene.gSceneConfig.scenedata[name].preexit != undefined))
                this.parseOBJ(this, CEFScene.gSceneConfig.scenedata[name].preexit.children(), "preexit");
            return (CEFObject_11.CEFObject.OKNAV);
        };
        CEFScene.prototype.onExitScene = function () {
            if (this.traceMode)
                CUtil_26.CUtil.trace("Default Exit Scene Behavior:");
            if ((CEFScene.gSceneConfig != null) && (CEFScene.gSceneConfig.scenedata[name].onexit != undefined))
                this.parseOBJ(this, CEFScene.gSceneConfig.scenedata[name].onexit.children(), "onexit");
        };
        CEFScene.prototype.demoBehavior = function () {
            if (this.traceMode)
                CUtil_26.CUtil.trace("Default demoBehavior: ");
        };
        CEFScene.prototype.initSeekArrays = function () {
        };
        CEFScene.prototype.doSeekForward = function (evt) {
            switch (evt.wozSeekSeq) {
            }
        };
        CEFScene.prototype.doSeekBackward = function (evt) {
        };
        return CEFScene;
    }(CEFObject_11.CEFObject));
    exports.CEFScene = CEFScene;
});
define("core/CEFRoot", ["require", "exports", "util/CUtil"], function (require, exports, CUtil_27) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MovieClip = createjs.MovieClip;
    var EFengine;
    var CEFRoot = (function (_super) {
        __extends(CEFRoot, _super);
        function CEFRoot() {
            var _this = _super.call(this) || this;
            _this._listenerArr = new Array;
            _this.traceMode = false;
            if (_this.traceMode)
                CUtil_27.CUtil.trace("CEFRoot:Constructor");
            _this.wozName = "CEF" + CEFRoot._wozInstance.toString();
            CEFRoot._wozInstance++;
            return _this;
        }
        CEFRoot.prototype.Destructor = function () {
            if (this.traceMode)
                CUtil_27.CUtil.trace("CEFRoot Destructor:");
            var subObj;
            for (var i1 = 0; i1 < this.numChildren; i1++) {
                subObj = this.getChildAt(i1);
                if (subObj instanceof CEFRoot) {
                    subObj.Destructor();
                }
            }
        };
        CEFRoot.prototype.captureXMLStructure = function (parentXML, iDepth) {
            var element;
            var elementOBJ = {};
            var elClass;
            var elwozname;
            for (var i1 = 0; i1 < this.numChildren; i1++) {
                element = this.getChildAt(i1);
                if (this.traceMode)
                    CUtil_27.CUtil.trace("\t\tCEFScene found subObject named:" + element.name + " ... in-place: ");
                if (element instanceof CEFRoot) {
                    elwozname = element.wozName;
                }
                else {
                    elwozname = "null";
                }
                elementOBJ = new String("<obj " + " class=\"" + elClass + "\" name=\"" + element.name + "\" x=\"" + element.x + "\" y=\"" + element.y + "\" w=\"" + element.width + "\" h=\"" + element.height + "\" r=\"" + element.rotation + "\" a=\"" + element.alpha + "\"/>");
                if ((iDepth < 1) && (element instanceof CEFRoot))
                    element.captureXMLStructure(elementOBJ, iDepth + 1);
            }
        };
        CEFRoot.prototype.resetXML = function () {
        };
        CEFRoot.prototype.loadXML = function (propVector) {
        };
        CEFRoot.prototype.saveXML = function () {
            var stateVector;
            return stateVector;
        };
        CEFRoot.prototype.getSymbolClone = function (_cloneOf, _named) {
            var xClone = "";
            CUtil_27.CUtil.trace(xClone);
            return xClone;
        };
        Object.defineProperty(CEFRoot.prototype, "gData", {
            get: function () {
                return CEFRoot.SceneData;
            },
            set: function (dataXML) {
                CEFRoot.SceneData = dataXML;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFRoot.prototype, "gPhase", {
            get: function () {
                return CEFRoot.fTutorPart;
            },
            set: function (phase) {
                CEFRoot.fTutorPart = phase;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFRoot.prototype, "gLogR", {
            get: function () {
                return CEFRoot.logR;
            },
            set: function (logr) {
                if (this.traceMode)
                    CUtil_27.CUtil.trace("Connecting Logger: ");
                CEFRoot.logR = logr;
            },
            enumerable: true,
            configurable: true
        });
        CEFRoot.prototype.resetSceneDataXML = function () {
        };
        Object.defineProperty(CEFRoot.prototype, "gForceBackButton", {
            get: function () {
                return CEFRoot.fForceBackButton;
            },
            set: function (fForce) {
                CEFRoot.fForceBackButton = fForce;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFRoot.prototype, "gNavigator", {
            get: function () {
                return CEFRoot._gNavigator;
            },
            set: function (navObject) {
                CEFRoot._gNavigator = navObject;
            },
            enumerable: true,
            configurable: true
        });
        CEFRoot.prototype.logState = function () {
            return "<null/>";
        };
        CEFRoot.prototype.IsUserDefined = function () {
            var iResult = 0;
            return iResult;
        };
        Object.defineProperty(CEFRoot.prototype, "captureLOGString", {
            get: function () {
                return "";
            },
            enumerable: true,
            configurable: true
        });
        CEFRoot.prototype.captureLOGState = function () {
            return "<null />";
        };
        CEFRoot.prototype.isDefined = function (prop) {
            var fResult;
            try {
                if (this.hasOwnProperty(prop)) {
                    fResult = true;
                }
            }
            catch (err) {
                if (this.traceMode)
                    CUtil_27.CUtil.trace(prop + " is Undefined");
                fResult = false;
            }
            return fResult;
        };
        CEFRoot.prototype.superPlay = function () {
            if (this.traceMode)
                CUtil_27.CUtil.trace(name + " Super Play");
            if (name == "SgenericPrompt")
                CUtil_27.CUtil.trace("SgenericPrompt Play Found in superPlay");
            _super.prototype.play.call(this);
        };
        CEFRoot.prototype.superStop = function () {
            if (this.traceMode)
                CUtil_27.CUtil.trace(name + " Super Stop");
            _super.prototype.stop.call(this);
        };
        CEFRoot.prototype.gotoAndStop = function (frame, scene) {
            if (scene === void 0) { scene = null; }
            if (this.traceMode)
                CUtil_27.CUtil.trace(name + " is stopped at : " + frame + ":" + scene);
            if (CEFRoot.gTutor)
                CEFRoot.gTutor.playRemoveThis(this);
            _super.prototype.gotoAndStop.call(this, frame + ":" + scene);
        };
        CEFRoot.prototype.stop = function () {
            if (this.traceMode)
                CUtil_27.CUtil.trace(name + " is stopped");
            if (CEFRoot.gTutor)
                CEFRoot.gTutor.playRemoveThis(this);
            _super.prototype.stop.call(this);
        };
        CEFRoot.prototype.gotoAndPlay = function (frame, scene) {
            if (scene === void 0) { scene = null; }
            if (this.traceMode)
                CUtil_27.CUtil.trace(name + " is playing at : " + frame + ":" + scene);
            if (name == "SgenericPrompt")
                CUtil_27.CUtil.trace("SgenericPrompt Play Found in gotoAndPlay");
            if (CEFRoot.gTutor)
                CEFRoot.gTutor.playAddThis(this);
            _super.prototype.gotoAndPlay.call(this, frame + ":" + scene);
        };
        CEFRoot.prototype.play = function () {
            if (this.traceMode)
                CUtil_27.CUtil.trace(name + " is playing");
            if (name == "SgenericPrompt")
                CUtil_27.CUtil.trace("SgenericPrompt Play Found in Play");
            if (CEFRoot.gTutor)
                CEFRoot.gTutor.playAddThis(this);
            _super.prototype.play.call(this);
        };
        CEFRoot.prototype.bindPlay = function (tutor) {
            if (this.traceMode)
                CUtil_27.CUtil.trace(name + " is playing");
            if (name == "SgenericPrompt")
                CUtil_27.CUtil.trace("SgenericPrompt Play Found in BindPlay");
            if (CEFRoot.gTutor)
                CEFRoot.gTutor.playAddThis(this);
            _super.prototype.play.call(this);
        };
        CEFRoot.prototype.setTopMost = function () {
            var topPosition;
            try {
                if (CEFRoot.gTutor) {
                    topPosition = CEFRoot.gTutor.numChildren - 1;
                    CEFRoot.gTutor.setChildIndex(this, topPosition);
                }
            }
            catch (err) {
            }
        };
        CEFRoot.prototype.startSession = function () {
            CEFRoot.fSessionTime = CUtil_27.CUtil.getTimer();
        };
        Object.defineProperty(CEFRoot.prototype, "sessionTime", {
            get: function () {
                var curTime;
                curTime = (CUtil_27.CUtil.getTimer() - CEFRoot.fSessionTime) / 1000.0;
                return curTime.toString();
            },
            enumerable: true,
            configurable: true
        });
        CEFRoot.prototype.instantiateObject = function (objectClass) {
            var tarObject;
            var ClassRef = this.getDefinitionByName(objectClass);
            tarObject = new ClassRef;
            return tarObject;
        };
        CEFRoot.prototype.getDefinitionByName = function (className) {
            var classConstructor;
            classConstructor = EFengine.efLibrary[className];
            return classConstructor;
        };
        CEFRoot.prototype.dumpStage = function (_obj, _path) {
            var sceneObj;
            for (var i1 = 0; i1 < _obj.numChildren; i1++) {
                sceneObj = _obj.getChildAt(i1);
                if (sceneObj) {
                    CUtil_27.CUtil.trace(_path + "." + sceneObj["name"] + " visible : " + ((sceneObj.visible) ? " true" : " false"));
                    if (sceneObj)
                        this.dumpStage(sceneObj, _path + "." + sceneObj["name"]);
                }
            }
        };
        CEFRoot.STAGEWIDTH = 1024;
        CEFRoot.STAGEHEIGHT = 768;
        CEFRoot.fRemoteMode = false;
        CEFRoot.fDemo = true;
        CEFRoot.fDebug = true;
        CEFRoot.fLog = false;
        CEFRoot.fDeferDemoClick = true;
        CEFRoot.fTutorPart = "Intro & Ramp Pre-test";
        CEFRoot.fFullSignIn = false;
        CEFRoot.fSkipAssess = false;
        CEFRoot.fEnableBack = true;
        CEFRoot.fForceBackButton = true;
        CEFRoot.fSkillometer = false;
        CEFRoot.sessionAccount = new Object();
        CEFRoot.serverUserID = 0;
        CEFRoot.fPlaybackMode = false;
        CEFRoot.WOZREPLAY = "rootreplay";
        CEFRoot.WOZCANCEL = "rootcancel";
        CEFRoot.WOZPAUSING = "rootpause";
        CEFRoot.WOZPLAYING = "rootplay";
        CEFRoot.SceneData = "<data/>";
        CEFRoot._wozInstance = 1;
        return CEFRoot;
    }(MovieClip));
    exports.CEFRoot = CEFRoot;
});
define("animationgraph/CAnimationModule", ["require", "exports", "animationgraph/CAnimationNode", "animationgraph/CAnimationTrack", "core/CEFRoot", "util/CUtil"], function (require, exports, CAnimationNode_2, CAnimationTrack_1, CEFRoot_19, CUtil_28) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CAnimationModule = (function (_super) {
        __extends(CAnimationModule, _super);
        function CAnimationModule(target) {
            if (target === void 0) { target = null; }
            var _this = _super.call(this, target) || this;
            _this._animations = new Array;
            _this._ndx = -1;
            return _this;
        }
        CAnimationModule.factory = function (parent, nodeName, moduleFactory) {
            var node = new CAnimationModule;
            if (moduleFactory.type == "node") {
                node.nodeFactory(parent, nodeName, moduleFactory);
                moduleFactory = parent._graphFactory.CModules[node._name];
            }
            node._reuse = moduleFactory.reuse;
            var actiontracks = moduleFactory.actiontracks;
            for (var track in actiontracks) {
                node._animations.push(new CAnimationTrack_1.CAnimationTrack(track, parent));
            }
            return node;
        };
        CAnimationModule.prototype.nextAnimation = function () {
            var nextTrackClass = null;
            var nextAnimation;
            var features;
            var featurePass = false;
            while (this._ndx < this._animations.length) {
                this._ndx++;
                nextAnimation = this._animations[this._ndx];
                nextTrackClass = null;
                if (nextAnimation != null) {
                    features = nextAnimation.features;
                    if (features != "") {
                        featurePass = CEFRoot_19.CEFRoot.gTutor.testFeatureSet(features);
                        if (featurePass) {
                            if (nextAnimation.hasPFeature) {
                                featurePass = nextAnimation.testPFeature();
                            }
                        }
                    }
                    else {
                        if (nextAnimation.hasPFeature) {
                            featurePass = nextAnimation.testPFeature();
                        }
                        else
                            featurePass = true;
                    }
                    if (featurePass) {
                        CUtil_28.CUtil.trace("Animation Feature: " + features + " passed:" + featurePass);
                        switch (nextAnimation.type) {
                            case "actiontrack":
                                nextTrackClass = nextAnimation.classname;
                                break;
                            case "choiceset":
                                nextTrackClass = nextAnimation.nextAnimation();
                                break;
                        }
                        break;
                    }
                }
                else
                    break;
            }
            if (this._ndx >= this._animations.length) {
                if (this._reuse) {
                    this.resetNode();
                }
            }
            return nextTrackClass;
        };
        CAnimationModule.prototype.seekToAnimation = function (seek) {
            var animation = null;
            var ndx = 0;
            for (var _i = 0, _a = this._animations; _i < _a.length; _i++) {
                var animation_1 = _a[_i];
                if (seek == animation_1.classname) {
                    this._ndx = ndx;
                    break;
                }
                ndx++;
            }
            return animation.classname;
        };
        CAnimationModule.prototype.applyNode = function () {
            return false;
        };
        CAnimationModule.prototype.resetNode = function () {
            this._ndx = -1;
        };
        return CAnimationModule;
    }(CAnimationNode_2.CAnimationNode));
    exports.CAnimationModule = CAnimationModule;
});
define("animationgraph/CAnimationConstraint", ["require", "exports", "core/CEFRoot", "util/CUtil"], function (require, exports, CEFRoot_20, CUtil_29) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CAnimationConstraint = (function (_super) {
        __extends(CAnimationConstraint, _super);
        function CAnimationConstraint() {
            return _super.call(this) || this;
        }
        CAnimationConstraint.factory = function (parent, factory) {
            var node = new CAnimationConstraint;
            node._parent = parent;
            node._cmd = factory.cmd;
            node._code = factory.code;
            return node;
        };
        CAnimationConstraint.prototype.execute = function () {
            var result = false;
            var sresult = "";
            switch (this._cmd) {
                case "test":
                    result = CEFRoot_20.CEFRoot.gTutor.testFeatureSet(this._code);
                    sresult = result ? " :passed." : " :failed.";
                    CUtil_29.CUtil.trace("Animation Constraint: " + this._code + sresult);
                    break;
                case "exec":
                    CUtil_29.CUtil.trace("R0 Belief: " + CEFRoot_20.CEFRoot.gTutor.ktSkills['rule0'].queryBelief());
                    break;
            }
            return result;
        };
        return CAnimationConstraint;
    }(Object));
    exports.CAnimationConstraint = CAnimationConstraint;
});
define("animationgraph/CAnimationGraph", ["require", "exports", "animationgraph/CAnimationNode", "animationgraph/CAnimationAction", "animationgraph/CAnimationModule", "animationgraph/CAnimationChoiceSet", "animationgraph/CAnimationConstraint", "core/CEFRoot"], function (require, exports, CAnimationNode_3, CAnimationAction_1, CAnimationModule_1, CAnimationChoiceSet_2, CAnimationConstraint_1, CEFRoot_21) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CAnimationGraph = (function (_super) {
        __extends(CAnimationGraph, _super);
        function CAnimationGraph() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._nodes = new Object;
            _this._modules = new Object;
            _this._choicesets = new Object;
            _this._actions = new Object;
            _this._graphs = new Object;
            _this._constraints = new Object;
            return _this;
        }
        CAnimationGraph.prototype.CAnimationGraph = function () {
        };
        CAnimationGraph.factory = function (parent, id, factoryName) {
            var animationgraph = new CAnimationGraph;
            animationgraph._graphFactory = CEFRoot_21.CEFRoot.gAnimationGraphDesc[factoryName];
            animationgraph.sceneInstance = parent;
            animationgraph.parseModules();
            animationgraph.parseActions();
            animationgraph.parseChoiceSets();
            animationgraph.parseConstraints();
            animationgraph.parseNodes();
            animationgraph.seekRoot();
            return animationgraph;
        };
        CAnimationGraph.prototype.seekRoot = function () {
            this._currNode = this._nodes["root"];
        };
        CAnimationGraph.prototype.onEnterRoot = function () {
            this._currNode.preEnter();
        };
        Object.defineProperty(CAnimationGraph.prototype, "sceneInstance", {
            get: function () {
                return this._parentScene;
            },
            set: function (scene) {
                this._parentScene = scene;
            },
            enumerable: true,
            configurable: true
        });
        CAnimationGraph.prototype.queryPFeature = function (pid, size, cycle) {
            var iter = 0;
            if (CAnimationGraph._pFeatures[pid] != undefined) {
                iter = CAnimationGraph._pFeatures[pid] + 1;
                if (iter >= size) {
                    iter = size - cycle;
                }
                CAnimationGraph._pFeatures[pid] = iter;
            }
            else
                CAnimationGraph._pFeatures[pid] = 0;
            return iter;
        };
        CAnimationGraph.prototype.nextAnimation = function () {
            var nextNode;
            if (this._currNode)
                do {
                    this._currAnimation = this._currNode.nextAnimation();
                    if (this._currAnimation == null) {
                        this._currNode = this._currNode.nextNode();
                        if (this._currNode) {
                            this._currNode.applyNode();
                        }
                    }
                } while ((this._currAnimation == null) && (this._currNode != null));
            this._prevAnimation = this._currAnimation;
            return this._currAnimation;
        };
        CAnimationGraph.prototype.parseNodes = function () {
            var nodeList = this._graphFactory.CNodes;
            for (var name_4 in nodeList) {
                if (name_4 != "COMMENT") {
                    switch (nodeList[name_4].subtype) {
                        case "action":
                            this._nodes[name_4] = CAnimationAction_1.CAnimationAction.factory(this, name_4, nodeList[name_4]);
                            break;
                        case "module":
                            this._nodes[name_4] = CAnimationModule_1.CAnimationModule.factory(this, name_4, nodeList[name_4]);
                            break;
                        case "choiceset":
                            this._nodes[name_4] = CAnimationChoiceSet_2.CAnimationChoiceSet.factory(this, name_4, nodeList[name_4]);
                            break;
                    }
                }
            }
            return true;
        };
        CAnimationGraph.prototype.parseModules = function () {
            var moduleFactory = this._graphFactory.CModules;
            for (var name_5 in moduleFactory) {
                if (name_5 != "COMMENT")
                    this._modules[name_5] = CAnimationModule_1.CAnimationModule.factory(this, name_5, moduleFactory[name_5]);
            }
            return true;
        };
        CAnimationGraph.prototype.parseActions = function () {
            var actionFactory = this._graphFactory.CActions;
            for (var name_6 in actionFactory) {
                if (name_6 != "COMMENT")
                    this._actions[name_6] = CAnimationAction_1.CAnimationAction.factory(this, name_6, actionFactory[name_6]);
            }
            return true;
        };
        CAnimationGraph.prototype.parseChoiceSets = function () {
            var choicesetFactory = this._graphFactory.CChoiceSets;
            for (var name_7 in choicesetFactory) {
                if (name_7 != "COMMENT")
                    this._choicesets[name_7] = CAnimationChoiceSet_2.CAnimationChoiceSet.factory(this, name_7, choicesetFactory[name_7]);
            }
            return true;
        };
        CAnimationGraph.prototype.parseConstraints = function () {
            var constraintFactory = this._graphFactory.CConstraints;
            for (var name_8 in constraintFactory) {
                if (name_8 != "COMMENT")
                    this._constraints[name_8] = CAnimationConstraint_1.CAnimationConstraint.factory(this, constraintFactory[name_8]);
            }
            return true;
        };
        CAnimationGraph.prototype.findNodeByName = function (name) {
            return this._nodes[name];
        };
        CAnimationGraph.prototype.findConstraintByName = function (name) {
            return this._constraints[name];
        };
        Object.defineProperty(CAnimationGraph.prototype, "node", {
            get: function () {
                return this._currNode;
            },
            set: function (newNode) {
                if (this._currNode != newNode)
                    this._currNode.resetNode();
                this._currNode = newNode;
            },
            enumerable: true,
            configurable: true
        });
        CAnimationGraph._pFeatures = new Object;
        return CAnimationGraph;
    }(CAnimationNode_3.CAnimationNode));
    exports.CAnimationGraph = CAnimationGraph;
});
define("animationgraph/CAnimationEdge", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CAnimationEdge = (function () {
        function CAnimationEdge() {
        }
        CAnimationEdge.factory = function (parent, factory) {
            var edge = new CAnimationEdge;
            edge._parent = parent;
            edge._edgeConst = factory.constraint;
            edge._edgeNode = factory.edge;
            return edge;
        };
        CAnimationEdge.prototype.testConstraint = function () {
            var result = true;
            var constraint = this._parent.findConstraintByName(this._edgeConst);
            if (constraint != null)
                result = constraint.execute();
            return result;
        };
        CAnimationEdge.prototype.followEdge = function () {
            return this._parent.findNodeByName(this._edgeNode);
        };
        return CAnimationEdge;
    }());
    exports.CAnimationEdge = CAnimationEdge;
});
define("animationgraph/CAnimationNode", ["require", "exports", "animationgraph/CAnimationEdge"], function (require, exports, CAnimationEdge_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var EventDispatcher = createjs.EventDispatcher;
    var CAnimationNode = (function (_super) {
        __extends(CAnimationNode, _super);
        function CAnimationNode(target) {
            if (target === void 0) { target = null; }
            var _this = _super.call(this) || this;
            _this._edges = new Array;
            return _this;
        }
        CAnimationNode.prototype.nodeFactory = function (parent, id, nodefactory) {
            this._parent = parent;
            this._id = id;
            this._type = nodefactory.type;
            this._name = nodefactory.name;
            this._preEnter = nodefactory.preenter;
            this._preExit = nodefactory.preexit;
            if (this._preEnter == "")
                this._preEnter = null;
            if (this._preExit == "")
                this._preExit = null;
            for (var _i = 0, _a = nodefactory.edges; _i < _a.length; _i++) {
                var edge = _a[_i];
                this._edges.push(CAnimationEdge_1.CAnimationEdge.factory(parent, edge));
            }
        };
        CAnimationNode.prototype.nextAnimation = function () {
            return null;
        };
        CAnimationNode.prototype.nextNode = function () {
            var edge;
            var node = null;
            if (this._preExit != null) {
            }
            for (var _i = 0, _a = this._edges; _i < _a.length; _i++) {
                edge = _a[_i];
                if (edge.testConstraint()) {
                    node = edge.followEdge();
                    if (node != null && node._preEnter != null) {
                    }
                    break;
                }
            }
            return node;
        };
        CAnimationNode.prototype.preEnter = function () {
            if (this._preEnter != null) {
            }
        };
        CAnimationNode.prototype.seekToAnimation = function (seek) {
            return null;
        };
        CAnimationNode.prototype.applyNode = function () {
            return false;
        };
        CAnimationNode.prototype.resetNode = function () {
        };
        return CAnimationNode;
    }(EventDispatcher));
    exports.CAnimationNode = CAnimationNode;
});
define("animationgraph/CAnimationAction", ["require", "exports", "animationgraph/CAnimationNode", "core/CEFRoot"], function (require, exports, CAnimationNode_4, CEFRoot_22) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CAnimationAction = (function (_super) {
        __extends(CAnimationAction, _super);
        function CAnimationAction(target) {
            if (target === void 0) { target = null; }
            return _super.call(this, target) || this;
        }
        CAnimationAction.factory = function (parent, nodeName, moduleFactory) {
            var node = new CAnimationAction;
            if (moduleFactory.type == "node") {
                node.nodeFactory(parent, nodeName, moduleFactory);
                moduleFactory = parent._graphFactory.CActions[node._name];
            }
            node._cmd = moduleFactory.cmd;
            node._code = moduleFactory.code;
            return node;
        };
        CAnimationAction.prototype.nextAnimation = function () {
            return null;
        };
        CAnimationAction.prototype.applyNode = function () {
            var result = false;
            switch (this._cmd) {
                case "test":
                    result = CEFRoot_22.CEFRoot.gTutor.testFeatureSet(this._code);
                    break;
                case "exec":
                    break;
            }
            return result;
        };
        return CAnimationAction;
    }(CAnimationNode_4.CAnimationNode));
    exports.CAnimationAction = CAnimationAction;
});
define("controls/CEFLabelButton", ["require", "exports", "core/CEFButton"], function (require, exports, CEFButton_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFLabelButton = (function (_super) {
        __extends(CEFLabelButton, _super);
        function CEFLabelButton() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CEFLabelButton.prototype.CEFLabelButton = function () {
        };
        CEFLabelButton.prototype.setLabel = function (newLabel) {
            this.Sup.Slabel.text = newLabel;
            this.Sover.Slabel.text = newLabel;
            this.Sdown.Slabel.text = newLabel;
            this.Sdisabled.Slabel.text = newLabel;
        };
        return CEFLabelButton;
    }(CEFButton_3.CEFButton));
    exports.CEFLabelButton = CEFLabelButton;
});
define("controls/CEFLabelControl", ["require", "exports", "core/CEFObject"], function (require, exports, CEFObject_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFLabelControl = (function (_super) {
        __extends(CEFLabelControl, _super);
        function CEFLabelControl() {
            return _super.call(this) || this;
        }
        CEFLabelControl.prototype.setLabel = function (newLabel, colour) {
            if (colour === void 0) { colour = 0x000000; }
        };
        return CEFLabelControl;
    }(CEFObject_12.CEFObject));
    exports.CEFLabelControl = CEFLabelControl;
});
define("core/CEFCheckButton", ["require", "exports", "core/CEFButton", "core/CEFRoot", "events/CEFMouseEvent", "util/CUtil"], function (require, exports, CEFButton_4, CEFRoot_23, CEFMouseEvent_7, CUtil_30) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFCheckButton = (function (_super) {
        __extends(CEFCheckButton, _super);
        function CEFCheckButton() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.fChecked = false;
            _this._ftrChecked = "";
            _this._ftrUnchecked = "";
            return _this;
        }
        CEFCheckButton.prototype.CEFCheckButton = function () {
            this.traceMode = false;
            if (this.traceMode)
                CUtil_30.CUtil.trace("CEFCheckButton:Constructor");
            this.addEventListener(CEFMouseEvent_7.CEFMouseEvent.WOZCLICK, this.doMouseClick);
        };
        CEFCheckButton.prototype.Destructor = function () {
            this.removeEventListener(CEFMouseEvent_7.CEFMouseEvent.WOZCLICK, this.doMouseClick);
            _super.prototype.Destructor.call(this);
        };
        CEFCheckButton.prototype.highLight = function (color) {
        };
        Object.defineProperty(CEFCheckButton.prototype, "label", {
            get: function () {
                return "";
            },
            set: function (newLabel) {
            },
            enumerable: true,
            configurable: true
        });
        CEFCheckButton.prototype.setLabel = function (newLabel) {
            this.label = newLabel;
        };
        CEFCheckButton.prototype.getLabel = function () {
            return "";
        };
        Object.defineProperty(CEFCheckButton.prototype, "showLabel", {
            set: function (bVisible) {
                this.Slabel.visible = bVisible;
            },
            enumerable: true,
            configurable: true
        });
        CEFCheckButton.prototype.captureDefState = function (TutScene) {
            _super.prototype.captureDefState.call(this, TutScene);
        };
        CEFCheckButton.prototype.restoreDefState = function (TutScene) {
            this.fChecked = false;
            _super.prototype.restoreDefState.call(this, TutScene);
        };
        CEFCheckButton.prototype.deepStateCopy = function (src) {
            this.fChecked = src["fChecked"];
            this.curState = src["curState"];
            this._isvalid = src["_isvalid"];
            this.label = src["Slabel"].label.text;
            this.Slabel.visible = src["Slabel"].visible;
            this.gotoState(this.curState);
            _super.prototype.deepStateCopy.call(this, src);
        };
        CEFCheckButton.prototype.captureLogState = function (obj) {
            if (obj === void 0) { obj = null; }
            obj = _super.prototype.captureLogState.call(this, obj);
            obj['checked'] = this.fChecked.toString();
            return obj;
        };
        CEFCheckButton.prototype.captureXMLState = function () {
            var xmlVal = _super.prototype.captureXMLState.call(this);
            xmlVal.checked = this.fChecked.toString();
            return xmlVal;
        };
        CEFCheckButton.prototype.resetState = function () {
            _super.prototype.resetState.call(this);
            this["Schecked"].visible = false;
        };
        CEFCheckButton.prototype.gotoState = function (sState) {
            if (this.traceMode)
                CUtil_30.CUtil.trace("CEFButton.gotoState: ", name + " " + sState);
            this.resetState();
            this.curState = sState;
            if (!this.fEnabled) {
                this["Sdisabled"].visible = true;
                this.fPressed = false;
            }
            else
                switch (sState) {
                    case "Sdown":
                        this["Sdown"].visible = true;
                        this.fPressed = true;
                        break;
                    case "Sup":
                        if (this.fChecked)
                            this["Schecked"].visible = true;
                        else
                            this["Sup"].visible = true;
                        this.fPressed = false;
                        break;
                    case "Sover":
                        if (!this.fPressed) {
                            if (this.fChecked)
                                this["Schecked"].visible = true;
                            else
                                this["Sover"].visible = true;
                        }
                        else
                            this["Sdown"].visible = true;
                        break;
                    case "Sout":
                        if (this.fChecked)
                            this["Schecked"].visible = true;
                        else
                            this["Sup"].visible = true;
                        break;
                }
        };
        CEFCheckButton.prototype.doMouseClick = function (evt) {
            this.setCheck(!this.fChecked);
            if (this.traceMode)
                CUtil_30.CUtil.trace("Setting Checked State: " + this.fChecked + " on button: " + name);
        };
        CEFCheckButton.prototype.setCheck = function (bCheck) {
            this.fChecked = bCheck;
            this.gotoState("Sup");
        };
        CEFCheckButton.prototype.getChecked = function () {
            return this.fChecked;
        };
        CEFCheckButton.prototype.assertFeatures = function () {
            if (this.fChecked) {
                this._activeFeature = this._ftrChecked;
            }
            else {
                this._activeFeature = this._ftrUnchecked;
            }
            if (this._activeFeature != "") {
                CEFRoot_23.CEFRoot.gTutor.addFeature = this._activeFeature;
            }
            return this.activeFeature;
        };
        CEFCheckButton.prototype.retractFeatures = function () {
            if (this._ftrChecked != "") {
                CEFRoot_23.CEFRoot.gTutor.delFeature = this._ftrChecked;
            }
            if (this._ftrUnchecked != "") {
                CEFRoot_23.CEFRoot.gTutor.delFeature = this._ftrUnchecked;
            }
        };
        CEFCheckButton.prototype.loadXML = function (xmlSrc) {
            _super.prototype.loadXML.call(this, xmlSrc);
            if (xmlSrc.valid != undefined)
                this._isvalid = xmlSrc.valid;
            if (xmlSrc.ftrChecked != undefined)
                this._ftrChecked = xmlSrc.ftrChecked;
            if (xmlSrc.ftrUnchecked != undefined)
                this._ftrUnchecked = xmlSrc.ftrUnchecked;
            if (xmlSrc.checked != undefined)
                this.setCheck(Boolean(xmlSrc.checked == "true" ? true : false));
            if (xmlSrc.label != undefined)
                this.setLabel(xmlSrc.label);
            if (xmlSrc.showlabel != undefined)
                this.showLabel = (Boolean(xmlSrc.showlabel == "true" ? true : false));
        };
        CEFCheckButton.prototype.saveXML = function () {
            var propVector;
            return propVector;
        };
        return CEFCheckButton;
    }(CEFButton_4.CEFButton));
    exports.CEFCheckButton = CEFCheckButton;
});
define("events/CEFButtonEvent", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Event = createjs.Event;
    var CEFButtonEvent = (function (_super) {
        __extends(CEFButtonEvent, _super);
        function CEFButtonEvent(type, bubbles, cancelable) {
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            return _super.call(this, type, bubbles, cancelable) || this;
        }
        CEFButtonEvent.WOZCHECKED = "wozchecked";
        CEFButtonEvent.WOZUNCHECKED = "wozunchecked";
        return CEFButtonEvent;
    }(Event));
    exports.CEFButtonEvent = CEFButtonEvent;
});
define("core/CEFButtonGroup", ["require", "exports", "core/CEFRoot", "core/CEFObject", "events/CEFButtonEvent", "util/CUtil"], function (require, exports, CEFRoot_24, CEFObject_13, CEFButtonEvent_1, CUtil_31) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFButtonGroup = (function (_super) {
        __extends(CEFButtonGroup, _super);
        function CEFButtonGroup() {
            var _this = _super.call(this) || this;
            _this.buttonType = new Array();
            _this._fRadioGroup = true;
            _this._inited = false;
            _this.onChangeScript = null;
            _this.buttons = new Array();
            return _this;
        }
        CEFButtonGroup.prototype.addButton = function (newButton, bType) {
            if (bType === void 0) { bType = ""; }
            this.buttons.push(newButton);
            this.buttonType.push(bType);
            newButton.addEventListener(CEFButtonEvent_1.CEFButtonEvent.WOZCHECKED, this.updateGroupChk);
            newButton.addEventListener(CEFButtonEvent_1.CEFButtonEvent.WOZUNCHECKED, this.updateGroupUnChk);
        };
        CEFButtonGroup.prototype.removeButton = function (newButton) {
            newButton.removeEventListener(CEFButtonEvent_1.CEFButtonEvent.WOZCHECKED, this.updateGroupChk);
            newButton.removeEventListener(CEFButtonEvent_1.CEFButtonEvent.WOZUNCHECKED, this.updateGroupUnChk);
        };
        CEFButtonGroup.prototype.updateGroupChk = function (evt) {
            var i1;
            var _radioReset = false;
            dispatchEvent(new Event(CEFButtonGroup.CHECKED));
            for (i1 = 0; i1 < this.buttons.length; i1++) {
                if (this.buttons[i1] == evt.target) {
                    if (this.buttonType[i1] == "radio")
                        _radioReset = true;
                }
            }
            if (this._fRadioGroup || _radioReset) {
                for (i1 = 0; i1 < this.buttons.length; i1++) {
                    if (this.buttons[i1] != evt.target) {
                        this.buttons[i1].setCheck(false);
                    }
                }
            }
            else {
                for (i1 = 0; i1 < this.buttons.length; i1++) {
                    if ((this.buttons[i1] != evt.target) && (this.buttonType[i1] == "radio")) {
                        this.buttons[i1].setCheck(false);
                    }
                }
            }
            if (this.onChangeScript != null)
                this.doChangeAction(evt);
        };
        CEFButtonGroup.prototype.updateGroupUnChk = function (evt) {
            this.dispatchEvent(new Event(CEFButtonEvent_1.CEFButtonEvent.WOZCHECKED));
            if (this.onChangeScript != null)
                this.doChangeAction(evt);
        };
        CEFButtonGroup.prototype.doChangeAction = function (evt) {
            try {
                eval(this.onChangeScript);
            }
            catch (e) {
                CUtil_31.CUtil.trace("Error in onChange script: " + this.onChangeScript);
            }
        };
        Object.defineProperty(CEFButtonGroup.prototype, "radioType", {
            set: function (fRadioGroup) {
                this._fRadioGroup = fRadioGroup;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFButtonGroup.prototype, "isComplete", {
            get: function () {
                var sResult = "false";
                for (var i1 = 0; i1 < this.buttons.length; i1++) {
                    if (this.buttons[i1].getChecked()) {
                        sResult = "true";
                        break;
                    }
                }
                return sResult;
            },
            enumerable: true,
            configurable: true
        });
        CEFButtonGroup.prototype.querySelectedValid = function () {
            var sResult = "true";
            for (var i1 = 0; i1 < this.buttons.length; i1++) {
                if (this.buttons[i1].getChecked()) {
                    if (this.buttons[i1].isValid == "false") {
                        sResult = "false";
                        break;
                    }
                }
                else {
                    if (this.buttons[i1].isValid == "true") {
                        sResult = "false";
                        break;
                    }
                }
            }
            return sResult;
        };
        CEFButtonGroup.prototype.resetAll = function () {
            for (var i1 = 0; i1 < this.buttons.length; i1++) {
                this.buttons[i1].resetState();
            }
        };
        CEFButtonGroup.prototype.highLightRightOnly = function () {
            for (var i1 = 0; i1 < this.buttons.length; i1++) {
                if (this.buttons[i1].isValid == "true")
                    this.buttons[i1].setCheck2(true);
                else
                    this.buttons[i1].resetState();
            }
        };
        CEFButtonGroup.prototype.highLightRightLabel = function (hColor) {
            for (var i1 = 0; i1 < this.buttons.length; i1++) {
                if (this.buttons[i1].isValid == "true")
                    this.buttons[i1].highLight(hColor);
            }
        };
        CEFButtonGroup.prototype.highLightWrong = function () {
            for (var i1 = 0; i1 < this.buttons.length; i1++) {
                if (this.buttons[i1].getChecked()) {
                    if (this.buttons[i1].isValid != "true") {
                        this.buttons[i1].setCheck3(true);
                    }
                }
            }
        };
        Object.defineProperty(CEFButtonGroup.prototype, "isValid", {
            get: function () {
                var sResult = "true";
                for (var i1 = 0; i1 < this.buttons.length; i1++) {
                    if (this.buttons[i1].getChecked() == true) {
                        if (this.buttons[i1].isValid != "true") {
                            sResult = "false";
                            break;
                        }
                    }
                    else {
                        if (this.buttons[i1].isValid == "true") {
                            sResult = "false";
                            break;
                        }
                    }
                }
                return sResult;
            },
            enumerable: true,
            configurable: true
        });
        CEFButtonGroup.prototype.assertFeatures = function () {
            var _feature;
            if (this.isValid == "true") {
                _feature = this._validFeature;
            }
            else {
                _feature = this._invalidFeature;
            }
            if (_feature != "")
                CEFRoot_24.CEFRoot.gTutor.addFeature = _feature;
            for (var i1 = 0; i1 < this.buttons.length; i1++) {
                this.buttons[i1].assertFeatures();
            }
            return _feature;
        };
        CEFButtonGroup.prototype.retractFeatures = function () {
            var _feature;
            if (this.isValid == "true") {
                _feature = this._validFeature;
            }
            else {
                _feature = this._invalidFeature;
            }
            if (_feature != "")
                CEFRoot_24.CEFRoot.gTutor.delFeature = _feature;
            for (var i1 = 0; i1 < this.buttons.length; i1++) {
                this.buttons[i1].retractFeatures();
            }
        };
        Object.defineProperty(CEFButtonGroup.prototype, "tallyValid", {
            get: function () {
                var iResult = 0;
                for (var i1 = 0; i1 < this.buttons.length; i1++) {
                    if (this.buttons[i1].getChecked() == true) {
                        if (this.buttons[i1].isValid != "true") {
                            iResult = 0;
                            break;
                        }
                        else
                            iResult++;
                    }
                }
                return iResult.toString();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFButtonGroup.prototype, "tallySelected", {
            get: function () {
                var iResult = 0;
                for (var i1 = 0; i1 < this.buttons.length; i1++) {
                    if (this.buttons[i1].getChecked() == true) {
                        iResult++;
                    }
                }
                return iResult.toString();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFButtonGroup.prototype, "ansText", {
            get: function () {
                var sResult = "";
                for (var i1 = 0; i1 < this.buttons.length; i1++) {
                    if (this.buttons[i1].getChecked()) {
                        if (sResult.length > 0)
                            sResult += ",";
                        sResult += this.buttons[i1].getLabel();
                    }
                }
                return sResult;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFButtonGroup.prototype, "inUse", {
            get: function () {
                return this._inited;
            },
            enumerable: true,
            configurable: true
        });
        CEFButtonGroup.prototype.logState = function () {
            var groupState;
            for (var i1 = 0; i1 < this.buttons.length; i1++) {
                if (this.buttons[i1].getChecked()) {
                    break;
                }
            }
            return groupState;
        };
        CEFButtonGroup.prototype.querylogGroup = function () {
            var groupState = "";
            for (var i1 = 0; i1 < this.buttons.length; i1++) {
                if (i1 > 0)
                    groupState += ",";
                if (this.buttons[i1].getChecked())
                    groupState += "B" + i1 + "_Checked";
                else
                    groupState += "B" + i1 + "_Unchecked";
            }
            return groupState;
        };
        CEFButtonGroup.prototype.loadXML = function (xmlSrc) {
            var tarButton;
            var objArray;
            _super.prototype.loadXML.call(this, xmlSrc);
            for (var _i = 0, _a = xmlSrc.button; _i < _a.length; _i++) {
                var butInst = _a[_i];
                CUtil_31.CUtil.trace(butInst.name);
                try {
                    objArray = butInst.name.split(".");
                    if (this.traceMode)
                        CUtil_31.CUtil.trace("Target Array: " + objArray[0]);
                    if (objArray.length)
                        tarButton = this.decodeTarget(this.parent, objArray);
                }
                catch (err) {
                    tarButton = null;
                }
                if (tarButton) {
                    if (butInst.type != undefined)
                        this.addButton(tarButton, butInst.type);
                    else
                        this.addButton(tarButton);
                }
            }
            if (xmlSrc.wozname != undefined)
                this.wozName = xmlSrc.wozname;
            if (xmlSrc.radioType != undefined)
                this.radioType = (Boolean(xmlSrc.radioType == "true" ? true : false));
            if (xmlSrc.validftr != undefined)
                this._validFeature = xmlSrc.validftr;
            if (xmlSrc.invalidftr != undefined)
                this._invalidFeature = xmlSrc.invalidftr;
            if (xmlSrc.onchange != undefined) {
                this.onChangeScript = xmlSrc.onchange;
            }
            this._inited = true;
        };
        CEFButtonGroup.prototype.saveXML = function () {
            var propVector;
            return propVector;
        };
        CEFButtonGroup.CHECKED = "ischecked";
        return CEFButtonGroup;
    }(CEFObject_13.CEFObject));
    exports.CEFButtonGroup = CEFButtonGroup;
});
define("core/CEFRadioButton", ["require", "exports", "events/CEFButtonEvent", "core/CEFCheckButton", "util/CUtil"], function (require, exports, CEFButtonEvent_2, CEFCheckButton_1, CUtil_32) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFRadioButton = (function (_super) {
        __extends(CEFRadioButton, _super);
        function CEFRadioButton() {
            return _super.call(this) || this;
        }
        CEFRadioButton.prototype.attachGroup = function (butGroup) {
            butGroup.addButton(this);
        };
        CEFRadioButton.prototype.doMouseClick = function (evt) {
            this.setCheck(true);
            if (this.traceMode)
                CUtil_32.CUtil.trace("Setting Checked State: " + this.fChecked + " on button: " + name);
        };
        CEFRadioButton.prototype.setCheck = function (bCheck) {
            _super.prototype.setCheck.call(this, bCheck);
            if (this.fChecked)
                this.dispatchEvent(new CEFButtonEvent_2.CEFButtonEvent(CEFButtonEvent_2.CEFButtonEvent.WOZCHECKED));
            else
                this.dispatchEvent(new CEFButtonEvent_2.CEFButtonEvent(CEFButtonEvent_2.CEFButtonEvent.WOZUNCHECKED));
        };
        CEFRadioButton.prototype.toString = function () {
            return this.getLabel();
        };
        return CEFRadioButton;
    }(CEFCheckButton_1.CEFCheckButton));
    exports.CEFRadioButton = CEFRadioButton;
});
define("core/CEFCheckBox", ["require", "exports", "core/CEFRadioButton", "events/CEFEvent", "util/CUtil"], function (require, exports, CEFRadioButton_1, CEFEvent_10, CUtil_33) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFCheckBox = (function (_super) {
        __extends(CEFCheckBox, _super);
        function CEFCheckBox() {
            return _super.call(this) || this;
        }
        CEFCheckBox.prototype.doMouseClick = function (evt) {
            this.setCheck(!this.fChecked);
            if (this.traceMode)
                CUtil_33.CUtil.trace("Setting Checked State: " + this.fChecked + " on button: " + name);
        };
        CEFCheckBox.prototype.setCheck = function (bCheck) {
            _super.prototype.setCheck.call(this, bCheck);
            this.dispatchEvent(new Event(CEFEvent_10.CEFEvent.CHANGE));
        };
        CEFCheckBox.prototype.setCheck2 = function (bCheck) {
            this.resetState();
            this["Scheck2"].visible = bCheck;
        };
        CEFCheckBox.prototype.setCheck3 = function (bCheck) {
            this.resetState();
            this["Scheck3"].visible = bCheck;
        };
        CEFCheckBox.prototype.resetState = function () {
            _super.prototype.resetState.call(this);
            this["Scheck2"].visible = false;
            this["Scheck3"].visible = false;
        };
        CEFCheckBox.prototype.deepStateCopy = function (src) {
            this.fChecked = src["fChecked"];
            this.curState = src["curState"];
            this._isvalid = src["_isvalid"];
            this["Schecked"].visible = src["Schecked"].visible;
            this["Scheck2"].visible = src["Scheck2"].visible;
            this["Scheck3"].visible = src["Scheck3"].visible;
            this.label = src["Slabel"].label.text;
        };
        return CEFCheckBox;
    }(CEFRadioButton_1.CEFRadioButton));
    exports.CEFCheckBox = CEFCheckBox;
});
define("core/CEFMouseMask", ["require", "exports", "core/CEFObject", "events/CEFMouseEvent", "util/CUtil"], function (require, exports, CEFObject_14, CEFMouseEvent_8, CUtil_34) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFMouseMask = (function (_super) {
        __extends(CEFMouseMask, _super);
        function CEFMouseMask() {
            var _this = _super.call(this) || this;
            _this.traceMode = false;
            _this.addEventListener(CEFMouseEvent_8.CEFMouseEvent.WOZCLICKED, _this.discardEvent);
            _this.addEventListener(CEFMouseEvent_8.CEFMouseEvent.WOZMOVE, _this.discardEvent);
            _this.addEventListener(CEFMouseEvent_8.CEFMouseEvent.WOZOVER, _this.discardEvent);
            _this.addEventListener(CEFMouseEvent_8.CEFMouseEvent.WOZOUT, _this.discardEvent);
            _this.addEventListener(CEFMouseEvent_8.CEFMouseEvent.WOZDOWN, _this.discardEvent);
            _this.addEventListener(CEFMouseEvent_8.CEFMouseEvent.WOZUP, _this.discardEvent);
            return _this;
        }
        CEFMouseMask.prototype.discardEvent = function (evt) {
            if (this.traceMode)
                CUtil_34.CUtil.trace("Attempting to stop Propogation", evt.target, evt.type);
            evt.stopPropagation();
        };
        CEFMouseMask.prototype.setObjMode = function (dlgPanel, sMode) {
            if (this.traceMode)
                CUtil_34.CUtil.trace("\t*** Start - Walking Dialog Objects***");
            for (var dialogObj in dlgPanel) {
                if (dialogObj != "instance" && dlgPanel[dialogObj].instance instanceof CEFObject_14.CEFObject) {
                    dlgPanel[dialogObj].instance.setAutomationMode(dlgPanel[dialogObj], sMode);
                }
            }
            if (this.traceMode)
                CUtil_34.CUtil.trace("\t*** End - Walking Dialog Objects***");
        };
        CEFMouseMask.prototype.dumpSceneObjs = function (dlgPanel) {
            for (var dialogObj in dlgPanel) {
                if (this.traceMode)
                    CUtil_34.CUtil.trace("\tNavPanelObj : " + dialogObj);
                if (dialogObj != "instance" && dlgPanel[dialogObj].instance instanceof CEFObject_14.CEFObject) {
                    if (this.traceMode)
                        CUtil_34.CUtil.trace("\tCEF***");
                    dlgPanel[dialogObj].instance.dumpSubObjs(dlgPanel[dialogObj], "\t");
                }
            }
        };
        return CEFMouseMask;
    }(CEFObject_14.CEFObject));
    exports.CEFMouseMask = CEFMouseMask;
});
define("core/CEFSceneNavigator", ["require", "exports", "core/CEFNavigator", "core/CEFRoot"], function (require, exports, CEFNavigator_3, CEFRoot_25) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFSceneNavigator = (function (_super) {
        __extends(CEFSceneNavigator, _super);
        function CEFSceneNavigator() {
            var _this = _super.call(this) || this;
            _this.StsceneTitle = new Array();
            _this.StscenePage = new Array();
            _this.StsceneSeq = new Array();
            _this.StsceneClass = new Array();
            _this.StscenePersist = new Array();
            _this.StsceneFeatures = new Array();
            return _this;
        }
        CEFSceneNavigator.prototype.addScene = function (SceneTitle, ScenePage, SceneName, SceneClass, ScenePersist, SceneFeatures) {
            if (SceneFeatures === void 0) { SceneFeatures = "null"; }
            this.sceneCnt++;
            this.StsceneTitle.push(SceneTitle);
            this.StscenePage.push(ScenePage);
            this.StsceneSeq.push(SceneName);
            this.StsceneClass.push(SceneClass);
            this.StscenePersist.push(ScenePersist.toString());
            if (SceneFeatures != "null")
                this.StsceneFeatures.push(SceneFeatures);
            else
                this.StsceneFeatures.push(null);
        };
        Object.defineProperty(CEFSceneNavigator.prototype, "scenePrev", {
            get: function () {
                return this.StscenePrev;
            },
            set: function (scenePrevINT) {
                this.StscenePrev = scenePrevINT;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFSceneNavigator.prototype, "sceneCurr", {
            get: function () {
                return this.StsceneCurr;
            },
            set: function (sceneCurrINT) {
                this.StsceneCurr = sceneCurrINT;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFSceneNavigator.prototype, "sceneCurrINC", {
            get: function () {
                var feature;
                var match = false;
                this.StsceneCurr++;
                while (this.StsceneFeatures[this.StsceneCurr] != null) {
                    if (!CEFRoot_25.CEFRoot.gTutor.testFeatureSet(this.StsceneFeatures[this.StsceneCurr]))
                        this.StsceneCurr++;
                    else
                        break;
                }
                return this.StsceneCurr;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFSceneNavigator.prototype, "sceneCurrDEC", {
            get: function () {
                var feature;
                var match = false;
                this.StsceneCurr--;
                while (this.StsceneFeatures[this.StsceneCurr] != null) {
                    if (!CEFRoot_25.CEFRoot.gTutor.testFeatureSet(this.StsceneFeatures[this.StsceneCurr]))
                        this.StsceneCurr++;
                    else
                        break;
                }
                return this.StsceneCurr;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFSceneNavigator.prototype, "sceneTitle", {
            get: function () {
                return this.StsceneTitle;
            },
            set: function (sceneTitleARRAY) {
                this.StsceneTitle = sceneTitleARRAY;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFSceneNavigator.prototype, "sceneSeq", {
            get: function () {
                return this.StsceneSeq;
            },
            set: function (sceneSeqARRAY) {
                this.StsceneSeq = sceneSeqARRAY;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFSceneNavigator.prototype, "scenePage", {
            get: function () {
                return this.StscenePage;
            },
            set: function (scenePageARRAY) {
                this.StscenePage = scenePageARRAY;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFSceneNavigator.prototype, "sceneName", {
            get: function () {
                return this.StsceneSeq;
            },
            set: function (scenePageARRAY) {
                this.StsceneSeq = scenePageARRAY;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFSceneNavigator.prototype, "sceneClass", {
            get: function () {
                return this.StsceneClass;
            },
            set: function (scenePageARRAY) {
                this.StsceneClass = scenePageARRAY;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFSceneNavigator.prototype, "scenePersist", {
            get: function () {
                return this.StscenePersist;
            },
            set: function (scenePageARRAY) {
                this.StscenePersist = scenePageARRAY;
            },
            enumerable: true,
            configurable: true
        });
        return CEFSceneNavigator;
    }(CEFNavigator_3.CEFNavigator));
    exports.CEFSceneNavigator = CEFSceneNavigator;
});
define("scenes/CEFNavDemo", ["require", "exports", "core/CEFRoot", "core/CEFDoc", "core/CEFSceneSequence", "events/CEFNavEvent", "util/CUtil"], function (require, exports, CEFRoot_26, CEFDoc_4, CEFSceneSequence_3, CEFNavEvent_4, CUtil_35) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFNavDemo = (function (_super) {
        __extends(CEFNavDemo, _super);
        function CEFNavDemo() {
            var _this = _super.call(this) || this;
            _this._scenesShown = false;
            if (_this.traceMode)
                CUtil_35.CUtil.trace("CEFNavDemo:Constructor");
            _this._demoPanel = _this.instantiateObject("CDemoPanel");
            _this._demoPanel.x = 0;
            _this._demoPanel.y = 0;
            _this._demoPanel.alpha = 1.0;
            _this._demoPanel.visible = true;
            _this._demoPanel.name = "SdemoPanel";
            _this._demoPanel["demoPath"] = CEFDoc_4.CEFDoc.gApp["_modulePath"];
            _this.addChild(_this._demoPanel);
            _this._demoPanel.addEventListener(CEFNavEvent_4.CEFNavEvent.WOZNAVTO, _this.gotoScene);
            CEFRoot_26.CEFRoot.gTutor.automateScene("SdemoScene", _this);
            return _this;
        }
        CEFNavDemo.prototype.gotoScene = function (evt) {
            var features;
            var featVect = new Array();
            var subFeature;
            if (evt.wozFeatures != null)
                CEFRoot_26.CEFRoot.gTutor.setTutorFeatures(evt.wozFeatures);
            if (!this._scenesShown) {
                CEFRoot_26.CEFRoot.gTutor.SnavPanel.visible = true;
                CEFRoot_26.CEFRoot.gTutor.StitleBar.visible = true;
                this._scenesShown = true;
            }
            CEFRoot_26.CEFRoot.gTutor.xitions.resetTransitions();
            CEFRoot_26.CEFRoot.gTutor.goToScene(new CEFNavEvent_4.CEFNavEvent(CEFNavEvent_4.CEFNavEvent.WOZNAVTO, evt.wozNavTarget));
        };
        return CEFNavDemo;
    }(CEFSceneSequence_3.CEFSceneSequence));
    exports.CEFNavDemo = CEFNavDemo;
});
define("events/CEFDialogEvent", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Event = createjs.Event;
    var CEFDialogEvent = (function (_super) {
        __extends(CEFDialogEvent, _super);
        function CEFDialogEvent(Result, type, bubbles, cancelable) {
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            var _this = _super.call(this, type, bubbles, cancelable) || this;
            _this.result = Result;
            return _this;
        }
        CEFDialogEvent.prototype.clone = function () {
            return new CEFDialogEvent(this.result, this.type, this.bubbles, this.cancelable);
        };
        CEFDialogEvent.ENDMODAL = "ENDMODAL";
        CEFDialogEvent.DLGOK = "DialogOK";
        CEFDialogEvent.DLGCANCEL = "DialogCancel";
        return CEFDialogEvent;
    }(Event));
    exports.CEFDialogEvent = CEFDialogEvent;
});
define("dialogs/CEFDialogBox", ["require", "exports", "core/CEFObject", "core/CEFDoc", "core/CEFMouseMask", "events/CEFDialogEvent", "util/CUtil"], function (require, exports, CEFObject_15, CEFDoc_5, CEFMouseMask_1, CEFDialogEvent_1, CUtil_36) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFDialogBox = (function (_super) {
        __extends(CEFDialogBox, _super);
        function CEFDialogBox() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CEFDialogBox.prototype.CEFDialogBox = function () {
        };
        CEFDialogBox.prototype.setTitle = function (txt) {
            this.Stitle.text = txt;
        };
        CEFDialogBox.prototype.moveDialog = function (X, Y) {
            this.x = X;
            this.y = Y;
        };
        CEFDialogBox.prototype.centerDialog = function () {
        };
        CEFDialogBox.prototype.doModal = function (accounts, Alpha, fAdd) {
            if (accounts === void 0) { accounts = null; }
            if (Alpha === void 0) { Alpha = 1; }
            if (fAdd === void 0) { fAdd = true; }
            this.fAddDlg = fAdd;
            if (fAdd) {
                this.sMask = new CEFMouseMask_1.CEFMouseMask();
                this.sMask.x = 0;
                this.sMask.y = 0;
                this.sMask.alpha = Alpha;
                this.sMask.visible = true;
                this.visible = true;
                if (CEFDoc_5.CEFDoc.gApp && CEFDoc_5.CEFDoc.gApp.Stutor) {
                    CEFDoc_5.CEFDoc.gApp.Stutor.addChild(this.sMask);
                    CEFDoc_5.CEFDoc.gApp.Stutor.addChild(this);
                }
            }
            else {
                this.sMask.x = 0;
                this.sMask.y = 0;
                this.sMask.alpha = Alpha;
                this.sMask.visible = true;
                this.visible = true;
                this.sMask.setTopMost();
                this.setTopMost();
            }
            if (CEFDoc_5.CEFDoc.gApp && CEFDoc_5.CEFDoc.gApp.Stutor && CEFDoc_5.CEFDoc.gApp.Stutor.cCursor)
                CEFDoc_5.CEFDoc.gApp.Stutor.cCursor.setTopMost();
        };
        CEFDialogBox.prototype.endModal = function (result) {
            if (this.fAddDlg) {
                this.visible = false;
                if (CEFDoc_5.CEFDoc.gApp && CEFDoc_5.CEFDoc.gApp.Stutor) {
                    CEFDoc_5.CEFDoc.gApp.Stutor.removeChild(this.sMask);
                    CEFDoc_5.CEFDoc.gApp.Stutor.removeChild(this);
                }
                this.sMask = null;
            }
            else {
                this.visible = false;
                this.sMask.visible = false;
            }
            this.dispatchEvent(new CEFDialogEvent_1.CEFDialogEvent(result, CEFDialogEvent_1.CEFDialogEvent.ENDMODAL));
        };
        CEFDialogBox.prototype.setObjMode = function (dlgPanel, sMode) {
            if (this.traceMode)
                CUtil_36.CUtil.trace("\t*** Start - Walking Dialog Objects***");
            for (var dialogObj in dlgPanel) {
                if (dialogObj != "instance" && dlgPanel[dialogObj].instance instanceof CEFObject_15.CEFObject) {
                    dlgPanel[dialogObj].instance.setAutomationMode(dlgPanel[dialogObj], sMode);
                }
            }
            if (this.traceMode)
                CUtil_36.CUtil.trace("\t*** End - Walking Dialog Objects***");
        };
        CEFDialogBox.prototype.dumpSceneObjs = function (dlgPanel) {
            for (var dialogObj in dlgPanel) {
                if (this.traceMode)
                    CUtil_36.CUtil.trace("\tNavPanelObj : " + dialogObj);
                if (dialogObj != "instance" && dlgPanel[dialogObj].instance instanceof CEFObject_15.CEFObject) {
                    if (this.traceMode)
                        CUtil_36.CUtil.trace("\tCEF***");
                    dlgPanel[dialogObj].instance.dumpSubObjs(dlgPanel[dialogObj], "\t");
                }
            }
        };
        CEFDialogBox.ENDMODAL = "ENDMODAL";
        return CEFDialogBox;
    }(CEFObject_15.CEFObject));
    exports.CEFDialogBox = CEFDialogBox;
});
define("dialogs/CDialogDesignPrompt1", ["require", "exports", "events/CEFMouseEvent", "dialogs/CEFDialogBox"], function (require, exports, CEFMouseEvent_9, CEFDialogBox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CDialogDesignPrompt1 = (function (_super) {
        __extends(CDialogDesignPrompt1, _super);
        function CDialogDesignPrompt1() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CDialogDesignPrompt1.prototype.CDialogDesignPrompt1 = function () {
            this.setTitle("Notice");
            this.Scancel.setLabel("Cancel");
        };
        CDialogDesignPrompt1.prototype.Destructor = function () {
            this.Scancel.removeEventListener(CEFMouseEvent_9.CEFMouseEvent.WOZCLICK, this.doCancel);
            _super.prototype.Destructor.call(this);
        };
        CDialogDesignPrompt1.prototype.doCancel = function (evt) {
            this.endModal(CDialogDesignPrompt1.DLGSTAY);
        };
        CDialogDesignPrompt1.prototype.doModal = function (accounts, Alpha, fAdd) {
            if (accounts === void 0) { accounts = null; }
            if (Alpha === void 0) { Alpha = 1; }
            if (fAdd === void 0) { fAdd = true; }
            _super.prototype.doModal.call(this, accounts, Alpha, fAdd);
            this.Scancel.addEventListener(CEFMouseEvent_9.CEFMouseEvent.WOZCLICK, this.doCancel);
        };
        CDialogDesignPrompt1.prototype.endModal = function (Result) {
            _super.prototype.endModal.call(this, Result);
            this.Scancel.removeEventListener(CEFMouseEvent_9.CEFMouseEvent.WOZCLICK, this.doCancel);
        };
        CDialogDesignPrompt1.DLGSTAY = "DLGStay";
        CDialogDesignPrompt1.DLGNEXT = "DLGNext";
        return CDialogDesignPrompt1;
    }(CEFDialogBox_1.CEFDialogBox));
    exports.CDialogDesignPrompt1 = CDialogDesignPrompt1;
});
define("core/CEFTutor", ["require", "exports", "core/CEFRoot", "core/CEFTutorRoot", "scenegraph/CSceneGraphNavigator", "util/CUtil"], function (require, exports, CEFRoot_27, CEFTutorRoot_2, CSceneGraphNavigator_2, CUtil_37) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFTutor = (function (_super) {
        __extends(CEFTutor, _super);
        function CEFTutor() {
            var _this = _super.call(this) || this;
            _this.tutorScenes = new Array();
            _this.Ramps_Pre_Title = "";
            _this.designTitle = "Design Ramp Experiments";
            _this.thinkTitle = "Think about designing experiments";
            _this.traceMode = false;
            CUtil_37.CUtil.trace("CEFTutor:Constructor");
            _this.SdlgPrompt.name = "SdlgPrompt";
            _this.SdlgPrompt.sMask.name = "SdlgMask";
            _this.addChild(_this.SdlgPrompt);
            _this.addChild(_this.SdlgPrompt.sMask);
            _this.SdlgPrompt.visible = false;
            _this.SdlgPrompt.sMask.visible = false;
            _this.instantiateKT();
            return _this;
        }
        CEFTutor.prototype.initializeScenes = function () {
            if (CEFRoot_27.CEFRoot.gSceneGraphDesc != null)
                CSceneGraphNavigator_2.CSceneGraphNavigator.rootGraphFactory(CEFRoot_27.CEFRoot.gSceneGraphDesc);
            if (this.StitleBar != null)
                this.StitleBar.configDemoButton(this);
        };
        CEFTutor.prototype.resetZorder = function () {
            if (this.StitleBar != null)
                this.StitleBar.setTopMost();
            if (this.Sscene0 != null)
                this.Sscene0.setTopMost();
            if (this.SdemoScene != null)
                this.SdemoScene.setTopMost();
        };
        CEFTutor.CREATE = true;
        CEFTutor.NOCREATE = false;
        CEFTutor.PERSIST = true;
        CEFTutor.NOPERSIST = false;
        CEFTutor.ENQUEUE = true;
        CEFTutor.NOENQUEUE = false;
        return CEFTutor;
    }(CEFTutorRoot_2.CEFTutorRoot));
    exports.CEFTutor = CEFTutor;
});
define("core/CEFTutorDoc", ["require", "exports", "core/CEFRoot", "core/CEFDoc", "core/CEFObject", "core/CEFCursorProxy", "events/CEFEvent", "util/CUtil"], function (require, exports, CEFRoot_28, CEFDoc_6, CEFObject_16, CEFCursorProxy_2, CEFEvent_11, CUtil_38) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFTutorDoc = (function (_super) {
        __extends(CEFTutorDoc, _super);
        function CEFTutorDoc() {
            var _this = _super.call(this) || this;
            _this._extLoader = false;
            _this._extConnection = false;
            _this._tutorFeatures = "FTR_PRETEST:FTR_TYPEA";
            _this._forcedPause = false;
            CUtil_38.CUtil.trace("CWOZTutorDoc:Constructor");
            addEventListener(CEFEvent_11.CEFEvent.ADDED_TO_STAGE, _this.initOnStage);
            CEFObject_16.CEFObject.initGlobals();
            return _this;
        }
        CEFTutorDoc.prototype.initOnStage = function (evt) {
            CUtil_38.CUtil.trace("CWOZTutorDoc:Object OnStage");
            removeEventListener(CEFEvent_11.CEFEvent.ADDED_TO_STAGE, this.initOnStage);
            addEventListener(CEFEvent_11.CEFEvent.REMOVED_FROM_STAGE, this.doOffStage);
            _super.prototype.initOnStage.call(this, evt);
            if (this.Stutor == null) {
                this.Stutor = this.instantiateObject("CEFTutor");
                this.Stutor.name = "Stutor";
                this.Stutor.setTutorDefaults(this._tutorFeatures);
                this.Stutor.setTutorFeatures("");
                this.addChild(this.Stutor);
            }
            CEFDoc_6.CEFDoc.tutorAutoObj = this.Stutor.tutorAutoObj;
            this.Stutor.initializeScenes();
            this.Stutor.initAutomation(CEFDoc_6.CEFDoc.tutorAutoObj);
            this.Stutor.replaceCursor();
            this.launchTutors();
        };
        CEFTutorDoc.prototype.doOffStage = function (evt) {
            CUtil_38.CUtil.trace("going off stage");
            removeEventListener(CEFEvent_11.CEFEvent.REMOVED_FROM_STAGE, this.doOffStage);
            addEventListener(CEFEvent_11.CEFEvent.ADDED_TO_STAGE, this.doOnStage);
            if (!CEFRoot_28.CEFRoot.gTutor.isPaused) {
                this._forcedPause = true;
                CEFRoot_28.CEFRoot.gTutor.wozPause();
            }
            this.Stutor.setCursor(CEFCursorProxy_2.CEFCursorProxy.WOZREPLAY);
        };
        CEFTutorDoc.prototype.doOnStage = function (evt) {
            CUtil_38.CUtil.trace("coming on stage");
            removeEventListener(CEFEvent_11.CEFEvent.ADDED_TO_STAGE, this.doOnStage);
            addEventListener(CEFEvent_11.CEFEvent.REMOVED_FROM_STAGE, this.doOffStage);
            if (this._forcedPause) {
                this._forcedPause = false;
                CEFRoot_28.CEFRoot.gTutor.wozPlay();
            }
            this.Stutor.setCursor(CEFCursorProxy_2.CEFCursorProxy.WOZLIVE);
        };
        Object.defineProperty(CEFTutorDoc.prototype, "extAccount", {
            set: function (Obj) {
                CEFRoot_28.CEFRoot.sessionAccount = Obj;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFTutorDoc.prototype, "extFTutorPart", {
            set: function (str) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFTutorDoc.prototype, "extFFullSignIn", {
            set: function (val) {
                CEFRoot_28.CEFRoot.fFullSignIn = (val == "true") ? true : false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFTutorDoc.prototype, "extFDemo", {
            set: function (val) {
                CEFRoot_28.CEFRoot.fDemo = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFTutorDoc.prototype, "extFDebug", {
            set: function (val) {
                CEFRoot_28.CEFRoot.fDebug = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFTutorDoc.prototype, "extFRemoteMode", {
            set: function (val) {
                CEFRoot_28.CEFRoot.fRemoteMode = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFTutorDoc.prototype, "extFDeferDemoClick", {
            set: function (val) {
                CEFRoot_28.CEFRoot.fDeferDemoClick = (val == "true") ? true : false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFTutorDoc.prototype, "extFSkillometer", {
            set: function (val) {
                CEFRoot_28.CEFRoot.fSkillometer = (val == "true") ? true : false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFTutorDoc.prototype, "extTutorFeatures", {
            set: function (ftrStr) {
                this._tutorFeatures = ftrStr;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFTutorDoc.prototype, "extLoader", {
            set: function (val) {
                this._extLoader = (val == "true") ? true : false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFTutorDoc.prototype, "extLoaded", {
            get: function () {
                return this._extLoader;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFTutorDoc.prototype, "extmodPath", {
            set: function (val) {
                this._modulePath = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFTutorDoc.prototype, "extLogManager", {
            set: function (val) {
                this.gLogR = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFTutorDoc.prototype, "extSceneDescr", {
            set: function (val) {
                CEFRoot_28.CEFRoot.gSceneConfig = JSON.parse(val);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFTutorDoc.prototype, "extSceneGraph", {
            set: function (val) {
                CEFRoot_28.CEFRoot.gSceneGraphDesc = JSON.parse(val);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFTutorDoc.prototype, "extAnimationGraph", {
            set: function (val) {
                CEFRoot_28.CEFRoot.gAnimationGraphDesc = JSON.parse(val);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFTutorDoc.prototype, "extForceBackButton", {
            set: function (fForce) {
                if (typeof fForce === 'string')
                    this.gForceBackButton = (fForce == "true") ? true : false;
                else if (typeof fForce === 'boolean')
                    this.gForceBackButton = fForce;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFTutorDoc.prototype, "extAspectRatio", {
            get: function () {
                return "STD";
            },
            enumerable: true,
            configurable: true
        });
        return CEFTutorDoc;
    }(CEFDoc_6.CEFDoc));
    exports.CEFTutorDoc = CEFTutorDoc;
});
define("events/CEFAutomationEvent", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Event = createjs.Event;
    var CEFAutomationEvent = (function (_super) {
        __extends(CEFAutomationEvent, _super);
        function CEFAutomationEvent(type, Result, bubbles, cancelable) {
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            var _this = _super.call(this, type, bubbles, cancelable) || this;
            _this._result = Result;
            return _this;
        }
        CEFAutomationEvent.prototype.clone = function () {
            return new CEFAutomationEvent(this.type, this._result, this.bubbles, this.cancelable);
        };
        CEFAutomationEvent.ENDPROMPT = "ENDPROMPT";
        return CEFAutomationEvent;
    }(Event));
    exports.CEFAutomationEvent = CEFAutomationEvent;
});
define("events/CEFCaptionEvent", ["require", "exports", "util/CUtil"], function (require, exports, CUtil_39) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Event = createjs.Event;
    var CEFCaptionEvent = (function (_super) {
        __extends(CEFCaptionEvent, _super);
        function CEFCaptionEvent(CapIndex, type, bubbles, cancelable) {
            if (type === void 0) { type = CEFCaptionEvent.WOZCAP; }
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            var _this = _super.call(this, type, bubbles, cancelable) || this;
            _this._CapIndex = CapIndex;
            return _this;
        }
        CEFCaptionEvent.prototype.clone = function () {
            CUtil_39.CUtil.trace("cloning WOZEvent:");
            return new CEFCaptionEvent(this._CapIndex, this.type, this.bubbles, this.cancelable);
        };
        CEFCaptionEvent.WOZCAP = "WOZCAPTION";
        return CEFCaptionEvent;
    }(Event));
    exports.CEFCaptionEvent = CEFCaptionEvent;
});
define("events/CEFSelectEvent", ["require", "exports", "util/CUtil"], function (require, exports, CUtil_40) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Event = createjs.Event;
    var CEFSelectEvent = (function (_super) {
        __extends(CEFSelectEvent, _super);
        function CEFSelectEvent(target, type, bubbles, cancelable) {
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            var _this = _super.call(this, type, bubbles, cancelable) || this;
            _this.wozSelection = target;
            return _this;
        }
        CEFSelectEvent.prototype.clone = function () {
            CUtil_40.CUtil.trace("cloning CEFSelectEvent:");
            return new CEFSelectEvent(this.wozSelection, this.type, this.bubbles, this.cancelable);
        };
        CEFSelectEvent.WOZTABSELECT = "WOZTABSELECT";
        CEFSelectEvent.WOZIMGSELECT = "WOZIMGSELECT";
        return CEFSelectEvent;
    }(Event));
    exports.CEFSelectEvent = CEFSelectEvent;
});
define("kt/CEFProdSys", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CWOZProdSys = (function () {
        function CWOZProdSys() {
            this.resetWorkMem();
        }
        CWOZProdSys.prototype.resetWorkMem = function () {
            this.wm = new Object;
        };
        CWOZProdSys.prototype.setWorkMem = function (prop, value) {
            this.wm[prop] = value;
        };
        CWOZProdSys.prototype.prop = function (_prop) {
            return this.wm[_prop].toString();
        };
        CWOZProdSys.prototype.value = function (_prop) {
            return this.wm[_prop];
        };
        CWOZProdSys.prototype.execRules = function () {
            this.wm.rule0 = false;
            this.wm.rule1 = false;
            this.wm.rule2 = false;
            this.wm.ruleTOV = false;
            this.wm.ruleVVFAR = false;
            this.wm.ruleCVSLOG = false;
            if (this.wm.ramp == "NC") {
                if (this.wm.reasoning == "PHRASE3") {
                    if (this.wm.corrTYPE1 == "true") {
                        this.wm.rule0 = true;
                    }
                    if (this.wm.corrTYPE2 == "true") {
                        this.wm.ruleTOV = true;
                    }
                }
                else if (this.wm.reasoning == "PHRASE6") {
                    if (this.wm.corrTYPE1 == "true") {
                        this.wm.rule0 = true;
                    }
                    if (this.wm.corrTYPE2 == "true") {
                        this.wm.ruleTOV = true;
                    }
                }
            }
            else if (this.wm.ramp == "CVS") {
                if (this.wm.reasoning == "PHRASE1") {
                    if (this.wm.CVSLogic == "TYPEA") {
                        this.wm.rule0 = true;
                        this.wm.rule1 = true;
                        this.wm.rule2 = true;
                        this.wm.ruleTOV = true;
                        this.wm.ruleVVFAR = true;
                    }
                    else if (this.wm.CVSLogic == "TYPEB") {
                        this.wm.rule0 = true;
                        this.wm.rule1 = true;
                        this.wm.rule2 = true;
                        this.wm.ruleTOV = true;
                        this.wm.ruleVVFAR = true;
                        this.wm.ruleCVSLOG = true;
                    }
                    else if (this.wm.CVSLogic == "TYPEC") {
                        this.wm.rule0 = true;
                        this.wm.rule1 = true;
                        this.wm.rule2 = true;
                    }
                }
                else if (this.wm.reasoning == "PHRASE3") {
                    if (this.wm.corrTYPE1 == "true") {
                        this.wm.rule0 = true;
                        this.wm.rule1 = true;
                    }
                    if (this.wm.corrTYPE2 == "true") {
                        this.wm.ruleTOV = true;
                    }
                    this.wm.ruleVVFAR = true;
                }
                else if (this.wm.reasoning == "PHRASE6") {
                    if (this.wm.corrTYPE1 == "true") {
                        this.wm.rule0 = true;
                        this.wm.rule1 = true;
                        this.wm.ruleVVFAR = true;
                    }
                    if (this.wm.corrTYPE2 == "true") {
                        this.wm.ruleTOV = true;
                    }
                }
            }
            else if (this.wm.ramp == "CVS_WV") {
                if (this.wm.reasoning == "PHRASE1") {
                    if (this.wm.CVSWVLogic == "TYPEA") {
                        this.wm.rule2 = true;
                    }
                    else if (this.wm.CVSWVLogic == "TYPEB") {
                        this.wm.rule1 = true;
                        this.wm.rule2 = true;
                        this.wm.ruleTOV = true;
                        this.wm.ruleVVFAR = true;
                        this.wm.ruleCVSLOG = true;
                    }
                    else if (this.wm.CVSWVLogic == "TYPEC") {
                        this.wm.rule1 = true;
                        this.wm.rule2 = true;
                    }
                }
                else if (this.wm.reasoning == "PHRASE3") {
                    if (this.wm.corrTYPE1 == "true") {
                        this.wm.rule0 = true;
                    }
                    if (this.wm.corrTYPE3 == "true") {
                        this.wm.rule1 = true;
                    }
                    this.wm.ruleTOV = true;
                    this.wm.ruleVVFAR = true;
                }
                else if (this.wm.reasoning == "PHRASE6") {
                    if (this.wm.corrTYPE1 == "true") {
                        this.wm.rule0 = true;
                    }
                    if (this.wm.corrTYPE2 == "true") {
                        this.wm.ruleTOV = true;
                    }
                    if (this.wm.corrTYPE3 == "true") {
                        this.wm.rule1 = true;
                        this.wm.ruleVVFAR = true;
                    }
                }
            }
            else if (this.wm.ramp == "SC") {
                if (this.wm.reasoning == "PHRASE4") {
                    if (this.wm.corrTYPE1 == "true") {
                        this.wm.rule0 = true;
                    }
                    if (this.wm.corrTYPE2 == "true") {
                        this.wm.ruleTOV = true;
                    }
                    if (this.wm.corrTYPE3 == "true") {
                        this.wm.rule1 = true;
                    }
                    this.wm.ruleVVFAR = true;
                }
                else if (this.wm.reasoning == "PHRASE6") {
                    if (this.wm.corrTYPE1 == "true") {
                        this.wm.rule0 = true;
                    }
                    if (this.wm.corrTYPE2 == "true") {
                        this.wm.ruleTOV = true;
                    }
                    if (this.wm.corrTYPE3 == "true") {
                        this.wm.rule1 = true;
                        this.wm.ruleVVFAR = true;
                    }
                }
            }
            else if (this.wm.ramp == "SC_WV") {
                if (this.wm.reasoning == "PHRASE4") {
                    if (this.wm.corrTYPE1 == "true") {
                        this.wm.rule0 = true;
                    }
                    if (this.wm.corrTYPE2 == "true") {
                        this.wm.ruleTOV = true;
                    }
                    if (this.wm.corrTYPE3 == "true") {
                        this.wm.rule1 = true;
                    }
                    this.wm.ruleVVFAR = true;
                }
                else if (this.wm.reasoning == "PHRASE6") {
                    if (this.wm.corrTYPE1 == "true") {
                        this.wm.rule0 = true;
                    }
                    if (this.wm.corrTYPE2 == "true") {
                        this.wm.ruleTOV = true;
                    }
                    if (this.wm.corrTYPE3 == "true") {
                        this.wm.rule1 = true;
                        this.wm.ruleVVFAR = true;
                    }
                }
            }
            else if (this.wm.ramp == "DC") {
                if (this.wm.reasoning == "PHRASE4") {
                    if (this.wm.corrTYPE1 == "true") {
                        this.wm.rule0 = true;
                    }
                    if (this.wm.corrTYPE2 == "true") {
                        this.wm.ruleTOV = true;
                    }
                    if (this.wm.corrTYPE3 == "true") {
                        this.wm.rule1 = true;
                    }
                    this.wm.ruleVVFAR = true;
                }
                else if (this.wm.reasoning == "PHRASE6") {
                    if (this.wm.corrTYPE1 == "true") {
                        this.wm.rule0 = true;
                    }
                    if (this.wm.corrTYPE2 == "true") {
                        this.wm.ruleTOV = true;
                    }
                    if (this.wm.corrTYPE3 == "true") {
                        this.wm.rule1 = true;
                        this.wm.ruleVVFAR = true;
                    }
                }
            }
            else if (this.wm.ramp == "MC") {
                if (this.wm.reasoning == "PHRASE2") {
                    this.wm.rule1 = true;
                    this.wm.ruleVVFAR = true;
                }
                else if (this.wm.reasoning == "PHRASE3") {
                    if (this.wm.corrTYPE1 == "true") {
                        this.wm.rule0 = true;
                    }
                    if (this.wm.corrTYPE2 == "true") {
                        this.wm.ruleTOV = true;
                    }
                    this.wm.rule1 = true;
                    this.wm.ruleVVFAR = true;
                }
                else if (this.wm.reasoning == "PHRASE6") {
                    if (this.wm.corrTYPE1 == "true") {
                        this.wm.rule0 = true;
                    }
                    if (this.wm.corrTYPE2 == "true") {
                        this.wm.ruleTOV = true;
                    }
                    this.wm.rule1 = true;
                    this.wm.ruleVVFAR = true;
                }
            }
            else if (this.wm.ramp == "HOTAT") {
                if (this.wm.reasoning == "PHRASE4") {
                    if (this.wm.corrTYPE1 == "true") {
                        this.wm.rule0 = true;
                    }
                    if (this.wm.corrTYPE2 == "true") {
                        this.wm.ruleTOV = true;
                    }
                    if (this.wm.corrTYPE3 == "true") {
                        this.wm.rule1 = true;
                    }
                    this.wm.ruleVVFAR = true;
                }
                else if (this.wm.reasoning == "PHRASE6") {
                    if (this.wm.corrTYPE1 == "true") {
                        this.wm.rule0 = true;
                    }
                    if (this.wm.corrTYPE2 == "true") {
                        this.wm.ruleTOV = true;
                    }
                    if (this.wm.corrTYPE3 == "true") {
                        this.wm.rule1 = true;
                        this.wm.ruleVVFAR = true;
                    }
                }
            }
        };
        return CWOZProdSys;
    }());
    exports.CWOZProdSys = CWOZProdSys;
});
define("navigation/CEFNavPanel", ["require", "exports", "core/CEFSceneNavigator", "util/CUtil", "core/CEFObject"], function (require, exports, CEFSceneNavigator_1, CUtil_41, CEFObject_17) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFNavPanel = (function (_super) {
        __extends(CEFNavPanel, _super);
        function CEFNavPanel() {
            var _this = _super.call(this) || this;
            _this.traceMode = false;
            if (_this.traceMode)
                CUtil_41.CUtil.trace("CEFNavPanel:Constructor");
            _this.sceneCurr = 0;
            _this.scenePrev = 0;
            return _this;
        }
        CEFNavPanel.prototype.initAutomation = function (_parentScene, scene, ObjIdRef, lLogger, lTutor) {
            var sceneObj;
            var wozObj;
            var wozRoot;
            this.objID = ObjIdRef + name;
            for (var i1 = 0; i1 < this.numChildren; i1++) {
                sceneObj = this.getChildAt(i1);
                scene[sceneObj.name] = new Object;
                scene[sceneObj.name].instance = sceneObj;
                if (this.traceMode)
                    CUtil_41.CUtil.trace("\t\tCEFNavPanel found subObject named:" + sceneObj.name + " ... in-place: ");
                if (sceneObj instanceof CEFObject_17.CEFObject) {
                    wozObj = sceneObj;
                    wozObj.initAutomation(_parentScene, scene[sceneObj.name], this.objID + ".", lLogger, lTutor);
                }
            }
        };
        CEFNavPanel.prototype.setObjMode = function (TutScene, sMode) {
            if (this.traceMode)
                CUtil_41.CUtil.trace("\t*** Start - Walking Top Level Nav Objects***");
            for (var sceneObj in TutScene) {
                if (sceneObj != "instance" && TutScene[sceneObj].instance instanceof CEFObject_17.CEFObject) {
                    TutScene[sceneObj].instance.setAutomationMode(TutScene[sceneObj], sMode);
                }
            }
            if (this.traceMode)
                CUtil_41.CUtil.trace("\t*** End - Walking Top Level Nav Objects***");
        };
        CEFNavPanel.prototype.dumpSceneObjs = function (TutScene) {
            for (var sceneObj in TutScene) {
                if (this.traceMode)
                    CUtil_41.CUtil.trace("\tNavPanelObj : " + sceneObj);
                if (sceneObj != "instance" && TutScene[sceneObj].instance instanceof CEFObject_17.CEFObject) {
                    if (this.traceMode)
                        CUtil_41.CUtil.trace("\tCEF***");
                    TutScene[sceneObj].instance.dumpSubObjs(TutScene[sceneObj], "\t");
                }
            }
        };
        return CEFNavPanel;
    }(CEFSceneNavigator_1.CEFSceneNavigator));
    exports.CEFNavPanel = CEFNavPanel;
});
define("scenes/CEFEndCloak", ["require", "exports", "core/CEFRoot", "util/CUtil", "core/CEFSceneSequence"], function (require, exports, CEFRoot_29, CUtil_42, CEFSceneSequence_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFEndCloak = (function (_super) {
        __extends(CEFEndCloak, _super);
        function CEFEndCloak() {
            var _this = _super.call(this) || this;
            if (_this.traceMode)
                CUtil_42.CUtil.trace("CEFEndCloak:Constructor");
            return _this;
        }
        CEFEndCloak.prototype.captureDefState = function (TutScene) {
            _super.prototype.captureDefState.call(this, TutScene);
        };
        CEFEndCloak.prototype.restoreDefState = function (TutScene) {
            _super.prototype.restoreDefState.call(this, TutScene);
        };
        CEFEndCloak.prototype.preEnterScene = function (lTutor, sceneLabel, sceneTitle, scenePage, Direction) {
            if (this.traceMode)
                CUtil_42.CUtil.trace("CEFEndCloak Pre-Enter Scene Behavior: " + sceneTitle);
            CEFRoot_29.CEFRoot.gTutor.showPPlay(false);
            CEFRoot_29.CEFRoot.gTutor.showReplay(false);
            CEFRoot_29.CEFRoot.gTutor.SnavPanel.SnextButton.enableButton(false);
            CEFRoot_29.CEFRoot.gTutor.SnavPanel.SbackButton.enableButton(false);
            return _super.prototype.preEnterScene.call(this, lTutor, sceneLabel, sceneTitle, scenePage, Direction);
        };
        return CEFEndCloak;
    }(CEFSceneSequence_4.CEFSceneSequence));
    exports.CEFEndCloak = CEFEndCloak;
});
define("scenes/CEFEndScene", ["require", "exports", "core/CEFSceneSequence", "events/CEFNavEvent", "util/CUtil"], function (require, exports, CEFSceneSequence_5, CEFNavEvent_5, CUtil_43) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFEndScene = (function (_super) {
        __extends(CEFEndScene, _super);
        function CEFEndScene() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CEFEndScene.prototype.CEFEndScene = function () {
            CUtil_43.CUtil.trace("CEFEndScene:Constructor");
            this.fComplete = true;
        };
        CEFEndScene.prototype.onDoneClick = function (evt) {
            this.dispatchEvent(new CEFNavEvent_5.CEFNavEvent(CEFNavEvent_5.CEFNavEvent.WOZNAVREPLAY));
        };
        CEFEndScene.prototype.onPostTest = function (evt) {
        };
        CEFEndScene.prototype.onUploadClick = function (evt) {
            dispatchEvent(new Event("pushlog"));
        };
        CEFEndScene.prototype.captureDefState = function (TutScene) {
            _super.prototype.captureDefState.call(this, TutScene);
        };
        CEFEndScene.prototype.restoreDefState = function (TutScene) {
            _super.prototype.restoreDefState.call(this, TutScene);
        };
        return CEFEndScene;
    }(CEFSceneSequence_5.CEFSceneSequence));
    exports.CEFEndScene = CEFEndScene;
});
define("scenes/CEFSceneN", ["require", "exports", "core/CEFRoot", "core/CEFSceneSequence", "events/CEFMouseEvent", "util/CUtil"], function (require, exports, CEFRoot_30, CEFSceneSequence_6, CEFMouseEvent_10, CUtil_44) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFSceneN = (function (_super) {
        __extends(CEFSceneN, _super);
        function CEFSceneN() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CEFSceneN.prototype.CEFSceneN = function () {
            CUtil_44.CUtil.trace("CEFSceneN:Constructor");
            this.SreplaySession.addEventListener(CEFMouseEvent_10.CEFMouseEvent.WOZCLICK, this.doReplay);
        };
        CEFSceneN.prototype.doReplay = function (evt) {
            CEFRoot_30.CEFRoot.gTutor.replayLiveStream();
        };
        CEFSceneN.prototype.captureDefState = function (TutScene) {
            _super.prototype.captureDefState.call(this, TutScene);
        };
        CEFSceneN.prototype.restoreDefState = function (TutScene) {
            _super.prototype.restoreDefState.call(this, TutScene);
        };
        return CEFSceneN;
    }(CEFSceneSequence_6.CEFSceneSequence));
    exports.CEFSceneN = CEFSceneN;
});
define("scenes/CEFStartScene", ["require", "exports", "core/CEFSceneSequence", "util/CUtil", "core/CEFRoot"], function (require, exports, CEFSceneSequence_7, CUtil_45, CEFRoot_31) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEFStartScene = (function (_super) {
        __extends(CEFStartScene, _super);
        function CEFStartScene() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CEFStartScene.prototype.CEFStartScene = function () {
            this.traceMode = false;
            if (this.traceMode)
                CUtil_45.CUtil.trace("CEFStartScene:Constructor");
            this.fComplete = true;
        };
        CEFStartScene.prototype.captureDefState = function (TutScene) {
            _super.prototype.captureDefState.call(this, TutScene);
        };
        CEFStartScene.prototype.restoreDefState = function (TutScene) {
            _super.prototype.restoreDefState.call(this, TutScene);
        };
        CEFStartScene.prototype.preEnterScene = function (lTutor, sceneLabel, sceneTitle, scenePage, Direction) {
            if (this.traceMode)
                CUtil_45.CUtil.trace("CEFStartScene Pre-Enter Scene Behavior: " + sceneTitle);
            CEFRoot_31.CEFRoot.gTutor.showReplay(false);
            CEFRoot_31.CEFRoot.gTutor.showPPlay(false);
            return _super.prototype.preEnterScene.call(this, lTutor, sceneLabel, sceneTitle, scenePage, Direction);
        };
        CEFStartScene.prototype.onEnterScene = function (Direction) {
            if (this.traceMode)
                CUtil_45.CUtil.trace("CEFStartScene Enter Scene Behavior: CEFRampScene0");
        };
        CEFStartScene.prototype.preExitScene = function (Direction, sceneCurr) {
            if (this.traceMode)
                CUtil_45.CUtil.trace("CEFStartScene Pre-Exit Scene Behavior:");
            CEFRoot_31.CEFRoot.gTutor.showReplay(false);
            CEFRoot_31.CEFRoot.gTutor.showPPlay(true);
            return ("OK");
        };
        return CEFStartScene;
    }(CEFSceneSequence_7.CEFSceneSequence));
    exports.CEFStartScene = CEFStartScene;
});
//# sourceMappingURL=TutorEngineOne.js.map