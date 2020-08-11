using Helpers;
using HttpdLib;
using Models;
using SolidShapeApi.Models;
using System;
using System.Net;

namespace SolidShape
{
	public class SolidShapeApi : CApiServer
	{
		public SolidShapeApi()
		{
			SetEndPointHandler("/api/solidshape/v1/health", Health);

			
			SetEndPointHandler("/api/solidshape/v1/init", SessionInit);
			SetEndPointHandler("/api/solidshape/v1/login", Login);

			SetEndPointHandler("/api/solidshape/v1/designs/list", DesignsList);
			SetEndPointHandler("/api/solidshape/v1/designs/get", DesignsGet);
			SetEndPointHandler("/api/solidshape/v1/designs/save", DesignsSave);
			//SetEndPointHandler("/api/solidshape/v1/designs/uploads/auth", DesignsUploadsAuth);
			//SetEndPointHandler("/api/solidshape/v1/designs/uploads/chunk", DesignsUploadsChunk);
		}

		override protected Int64 ValidateSession()
		{
			try
			{
				String sAuthHeader = Types.ToString(Request.Params.Server["Authorization"], Types.ToString(Request.Params.Server["authorization"]));
				String sSKEY = Types.ToString(sAuthHeader.Replace("Bearer ", ""));


				Int64 UserID = Auth.SKEY.Decode(sSKEY);

				if (UserID > 0)
					return UserID;
			}
			catch (Exception Ex)
			{
				LogHelper.Error("Exception: {0}", Ex.Message);
			}

			return -1;
		}

		[HTTPMethod(Public = true, Type = CRequest.Method.ALL)]
		void Health()
		{
			//String sAuthHeader = Types.ToString(Request.Params.Server["Authorization"], Types.ToString(Request.Params.Server["authorization"])).Replace("Bearer ", "");
			//if (sAuthHeader != Sets.SOLIDSHAPE_API_KEY)
			//	ThrowError(HTTPStatusCode.Unauthorized_401, "Authorization Bearer != Sets.ADMIN_API_KEY - Remote IP:" + Request.RemoteAddr);

			Body = "WORKING";   // Aggiungere dati di info sullo status del processo
			StatusCode = HTTPStatusCode.OK_200;
		}

		[HTTPMethod(Public = true, Type = CRequest.Method.ALL)]
		void Login()
		{
			// Fase 1 - Verifica parametri ed acquisizione
			String MissingParameter = CheckMissingParams(new String[] { "Email", "Password" });
			if (MissingParameter != null)
				ThrowError(HTTPStatusCode.Bad_Request_400, MissingParameter);

			String sEmail = Types.ToString(Params["Email"]);
			String sPassword = Types.ToString(Params["Password"]);

			String sSKEY = Auth.Login(sEmail, sPassword, Db);
			if (sSKEY == null)
			{
				StatusCode = HTTPStatusCode.Unauthorized_401;
				return;
			}

			StatusCode = HTTPStatusCode.OK_200;
			Body = new
			{
				Email = sEmail,
				SKEY = sSKEY
			};		
		}

		[HTTPMethod(Public = false, Type = CRequest.Method.POST)]
		void SessionInit()
		{
			StatusCode = HTTPStatusCode.OK_200;
		}

		[HTTPMethod(Public = false, Type = CRequest.Method.POST)]
		void DesignsList()
		{
			Designs.TDesign[] vd = Designs.List(LoggedUserID, Db);

			StatusCode = HTTPStatusCode.OK_200;
			Body = Designs.Format(vd);
		}

		[HTTPMethod(Public = false, Type = CRequest.Method.POST)]
		void DesignsGet()
		{
			// Fase 1 - Verifica parametri ed acquisizione
			String MissingParameter = CheckMissingParams(new String[] { "ID" });
			if (MissingParameter != null)
				ThrowError(HTTPStatusCode.Bad_Request_400, MissingParameter);

			Int64 DesignID = Types.ToInt64(Params["ID"]);

			Designs.TDesign d = Designs.Get(LoggedUserID, DesignID, Db);

			StatusCode = HTTPStatusCode.OK_200;
			Body = d.Format();
		}

		[HTTPMethod(Public = false, Type = CRequest.Method.POST)]
		void DesignsSave()
		{
			String MissingParameter = CheckMissingParams(new String[] { "ID" });
			if (MissingParameter != null)
				ThrowError(HTTPStatusCode.Bad_Request_400, MissingParameter);

			Int64 DesignID = Types.ToInt64(Params["ID"],-1);
			if (DesignID > 0 && Designs.HasRights(LoggedUserID, DesignID, Db) == false)
				ThrowError(HTTPStatusCode.Forbidden_403, "DesignID > 0 && Designs.HasRights(LoggedUserID,DesignID, Db)==false - DesignID=" + DesignID);

			KeyValueHelper kvIn = new KeyValueHelper();
			if (Types.ToString(Params["ID"])!="") kvIn["Title"] = Types.ToString(Params["Title"]);
			if (Types.ToString(Params["STLUploadToken"]) != "") kvIn["STLUploadToken"] = Types.ToString(Params["STLUploadToken"]);

			Designs.TDesign d = Designs.Save(LoggedUserID, DesignID, kvIn, Db);

			StatusCode = HTTPStatusCode.OK_200;
			Body = d.Format();
		}

	}
}