import moment from 'moment';

var Types = {

	// Scrive il messaggio Message a console come errore a console se la Condition non è vera
	// Ritorna true se la condizione è vera, false se non lo è
	Assert: function (Condition, Message) {
		if (Condition != true)
			console.error(Message);

		return (Condition == true);
	},

	// Converte un valore ad intero, se null lo pone a 0 oppure al valore passato come WhenNullVal
	ToInt: function (Value, WhenNullVal) {
		if (WhenNullVal == null)
			WhenNullVal = 0;
		if (Value == null || Value == "")
			return WhenNullVal;

		return parseInt(Value);
	},

	// Converte un valore a stringa, se null lo pone a "" oppure al valore passato come WhenNullVal
	ToString: function (Value, WhenNullVal) {
		if (WhenNullVal == null)
			WhenNullVal = "";
		if (Value == null)
			return WhenNullVal;

		return Value.toString();
	},

	// Converte un valore a float, se null lo pone a 0 oppure al valore passato come WhenNullVal
	ToFloat: function (Value, WhenNullVal) {
		if (WhenNullVal == null)
			WhenNullVal = 0;
		if (Value == null)
			return WhenNullVal;

		return parseFloat(Value);
	},

	// Converte un valore a bool, se null lo pone a false oppure al valore passato come WhenNullVal
	ToBool: function (Value, WhenNullVal) {

		if (WhenNullVal == null)
			WhenNullVal = false;
		if (Value == null)
			return WhenNullVal;

		if (Value === true)
			return true;
		if (Value === false)
			return false;

		if (typeof Value === 'string' && Value.toLowerCase() == 'true')
			return true;

		return (Types.ToInt(Value) > 0);
	},

	// Converte un valore a data, se null o non convertibile a data lo pone a Date(1970,1,1) oppure al valore passato come WhenNullVal
	ToDate: function (Value, WhenNullVal) {
		// TK: STEFANO - CTBT-980 START
		if (typeof WhenNullVal == "undefined")
			WhenNullVal = new Date(1970, 1, 1);

		// Value is null or empty string
		if (!Value)
			return WhenNullVal;

		// Is already a date
		if (typeof Value.getMonth == "function")
			return Value;

		// Process date as string
		var StringDateUTC = Value.toString();
		let date = null;
		if (StringDateUTC != null) {
			var idxDot = StringDateUTC.indexOf(".");
			if (idxDot > 0)
				StringDateUTC = StringDateUTC.substring(0, idxDot);

			StringDateUTC = StringDateUTC.replace(" ", "T");
			if (StringDateUTC.indexOf("Z") == -1)
				StringDateUTC += "Z";

			date = new Date(StringDateUTC);
		}
		else {
			var sDateUTC = new Date().toISOString();
			date = new Date(sDateUTC);
		}

		if (date == null)
			return WhenNullVal;

		return date;
		// TK: STEFANO - CTBT-980 END
	},

	IsDateEmpty: function (date) {
		var dt = Types.ToDate(date);

		if (dt.getFullYear() == "0001")
			return true;

		return false;
	},

	// Verifica se il parametro è di tipo array
	IsArray: function (obj) {
		return (obj != null && Array == obj.constructor);
	},

	// Dato un oggetto di tipo non specificato (array associativo), ed un oggetto di tipo conosciuto
	// ritorna un oggetto con le properties dell'oggetto di tipo conosciuto fillate con i valori dell'array associativo corrispondenti
	// segnala a console eventuali mancanze ed errori di tipo
	//ToObject: function (UnknowObj, KnownObj) {
	CheckObj: function (UnknowObj, KnownObj) {

		// Suppone il Unknown Obj come se fosse un array, poi se non lo è si regola in output
		var UnknowObjArray = UnknowObj;
		if (UnknowObjArray == null) {
			console.error("TypeHelper.CheckObj - UnknowObj is null");
			UnknowObjArray = [{}];
		}
		else if (Array.isArray(UnknowObj) == false)
			UnknowObjArray = [UnknowObjArray];

		if (KnownObj == null) {
			console.error("TypeHelper.CheckObj - KnownObj is null");
			return UnknowObj;
		}

		// Estrae tutte per properities dell'oggetto di partenza
		var Props = [];
		for (var PropName in KnownObj) {
			if (KnownObj.hasOwnProperty(PropName)) {

				var Type = typeof (KnownObj[PropName]);
				var toClass = {}.toString;
				if (toClass.call(KnownObj[PropName]) == toClass.call(new Date))
					Type = "date";

				if ((["number", "string", "boolean", "object", "date"]).indexOf(Type) == -1)
					console.error("TypeHelper.CheckObj - unsupported property type copied As Is - Property: " + PropName + " - Type: " + Type);

				Props.push({ "PropName": PropName, "Type": Type });
			}
		}

		for (var i = 0; i < UnknowObjArray.length; i++) {
			var retObj = {};

			// Copia le proprietà enumerabili dell'oggetto sorgente in quello destinazione
			Object.assign(retObj, KnownObj);

			var MissingFields = [];

			// Inizializza clonando l'oggetto di partenza e prova ad assegnarne i valori
			for (var ip = 0; ip < Props.length; ip++) {
				var KOPType = Props[ip].Type;
				var PropName = Props[ip].PropName;
				var UObj = UnknowObjArray[i];

				if (UObj.hasOwnProperty(PropName)) {
					switch (KOPType) {
						case "number":
							UObj[PropName] = Types.ToFloat(UObj[PropName], KnownObj[PropName]);
							break;
						case "string":
							UObj[PropName] = Types.ToString(UObj[PropName], KnownObj[PropName]);
							break;
						case "boolean":
							UObj[PropName] = Types.ToBool(UObj[PropName], KnownObj[PropName]);
							break;
						case "date":
							UObj[PropName] = Types.ToDate(UObj[PropName], KnownObj[PropName]);
							break;
						case "object":
							UObj[PropName] = Types.CheckObj(UObj[PropName], KnownObj[PropName]);
							console.error("TypeHelper.CheckObj - object type: " + PropName);
							break;
						default:
							UObj[PropName] = UObj[PropName];
							break;
					}

				}
				else
					MissingFields.push(PropName);
			}
			if (MissingFields.length > 0)
				console.error("TypeHelper.CheckObj - UnknowObj[" + i + "] misses properties: " + MissingFields.join());
		}

		return UnknowObj;
	},

	// Dato un oggetto permette di gestire le proprità con gli handlers di get e di setted
	// Quando viene richiamata una porprità in get viene chiamato il rispettivo Handler che può cambiare il valore ritornato
	// L'handler di get è una funzione definita nell'oggetto che ha nome "OnGet_<NOME_PROPRIETA>"
	// Quando viene cambiato un valore di una porprità in set, viene chiamatao l'handler di Setted che ha per parametri il NewVal e l'OldVal
	// L'handler di setted è una funzione definita nell'oggetto che ha nome "OnSetted_<NOME_PROPRIETA>"
	// Le proprità vengono ridefinite in variabili dirette ed interne alla proprità __OrigProperties
	HandlerizeObject: function (oObject) {
		if (oObject["__OrigProperties"] == null)
			oObject["__OrigProperties"] = {};

		Object.keys(oObject).forEach(function (Key, index) {
			if (Key == "__OrigProperties")
				return;

			var isFunction = !!(Key && Key.constructor && Key.call && Key.apply);
			if (isFunction)
				return;

			if (oObject["OnGet_" + Key] != null || oObject["OnSet_" + Key] != null || oObject["OnSetted_" + Key] != null) {
				oObject["__OrigProperties"][Key] = oObject[Key];

				Object.defineProperty(oObject, Key, {
					get: function () {
						var fn = oObject["OnGet_" + Key];
						if (fn != null) {
							var ret = null;
							try {
								ret = fn(oObject["__OrigProperties"][Key]);
							}
							catch (e) { };

							if (typeof ret === 'undefined')
								ret = oObject["__OrigProperties"][Key];

							return ret;
						}
						return oObject["__OrigProperties"][Key];
					},
					set: function (NewVal) {
						var OldVal = oObject["__OrigProperties"][Key];
						var fn = oObject["OnSet_" + Key];
						if (fn != null) {
							var ret;
							try {
								ret = fn(NewVal, OldVal);
							}
							catch (e) { };

							if (typeof ret !== 'undefined')
								NewVal = ret;
						}

						oObject["__OrigProperties"][Key] = NewVal;

						var fnComplete = oObject["OnSetted_" + Key];
						if (fnComplete != null) {
							try {
								fnComplete(NewVal, OldVal);
							}
							catch (e) { };
						}
					}
				});
			}
		});
	},

	Timestamp:
	{
		Now: function () {
			var sDateUTC = new Date().toISOString();
			return new Date(sDateUTC);
		},

		Get: function (StringDateUTC) {
			if (StringDateUTC != null) {

				var idxDot = StringDateUTC.indexOf(".");
				if (idxDot > 0)
					StringDateUTC = StringDateUTC.substring(0, idxDot);

				StringDateUTC = StringDateUTC.replace(" ", "T");
				if (StringDateUTC.indexOf("Z") == -1)
					StringDateUTC += "Z";

				return new Date(StringDateUTC);
			}

			var sDateUTC = new Date().toISOString();
			return new Date(sDateUTC);
		},

		GetTime: function (StringDateUTC) {
			if (StringDateUTC != null) {
				var minutes = StringDateUTC.getMinutes();
				if (minutes < 10)
					minutes = "0" + minutes;
				var seconds = StringDateUTC.getSeconds();
				if (seconds < 10)
					seconds = "0" + seconds;
				var hours = StringDateUTC.getHours();
				if (hours < 10)
					hours = "0" + hours;
				return hours + ':' + minutes + ':' + seconds;
			}

			return '-:-:-';
		},

		Format: function (date, FormatString) {
			if (FormatString == null)
				FormatString = 'YYYY-MM-DD HH:mm:ss';

			if (typeof moment === 'undefined') {
				console.error("moment.js not found");
				return date.toString()
			}

			return moment(date).format(FormatString);
		},

		Prettify: function (iTimeStamp, ShortDate) {
			if (iTimeStamp instanceof Date)
				iTimeStamp = iTimeStamp.toISOString();

			iTimeStamp = Types.ToDate(iTimeStamp);

			var CurrentDate = "Oggi, " + Types.Timestamp.Format(iTimeStamp, 'HH:mm');

			if (iTimeStamp.getDate() == Types.Timestamp.Now().getDate() - 1 && iTimeStamp.getMonth() == Types.Timestamp.Now().getMonth())
				CurrentDate = "Ieri, " + Types.Timestamp.Format(iTimeStamp, 'HH:mm');
			else if (iTimeStamp.getDate() != Types.Timestamp.Now().getDate()) {
				CurrentDate = Types.Timestamp.Format(iTimeStamp, 'DD/MM/YYYY');
				if (Types.ToBool(ShortDate) == false)
					CurrentDate += ', ' + Types.Timestamp.Format(iTimeStamp, 'HH:mm');
			}
			if (iTimeStamp.getDate() == Types.Timestamp.Now().getDate() && iTimeStamp.getMonth() != Types.Timestamp.Now().getMonth()) {
				CurrentDate = Types.Timestamp.Format(iTimeStamp, 'DD/MM/YYYY');
				if (Types.ToBool(ShortDate) == false)
					CurrentDate += ', ' + Types.Timestamp.Format(iTimeStamp, 'HH:mm');
			}
			return CurrentDate;
		}
	},

};

export default Types;
window.Types = Types;