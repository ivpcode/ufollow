using Helpers;
using Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace SolidShapeApi.Models
{
	class Auth
	{
		public class TUser
		{
			public Int64 UserID = -1;
			public String Email;

			[JsonIgnore]
			public String EncodedPassword;
		}

		public static String EncodePassword(String sPsw)
		{
			return Utilities.SHA256(Types.ToString(sPsw));
		}

		public class SKEY
		{
			public static String Encode(Int64 UserID)
			{
				return Blowfish.Encrypt(UserID.ToString("D20"), Sets.SOLIDSHAPE_API_KEY);
			}

			public static Int64 Decode(String sSKEY)
			{
				try
				{
					return Types.ToInt64(Blowfish.Decrypt(sSKEY, Sets.SOLIDSHAPE_API_KEY), -1);
				}
				catch { }

				return -1;
			}

		}

		public static String Login(String Email, String Password, DatabaseHelper Db)
		{
			try
			{
				String ep = EncodePassword(Password);
				Int64 UserID = Types.ToInt64(Db.DoOneFieldQuery("SELECT ID FROM users WHERE Email=@0 AND EncodedPassword=@1", Email, EncodePassword(Password)), -1);
				if (UserID > 0)
					return SKEY.Encode(UserID);
			}
			catch(Exception Ex)
			{
				LogHelper.Error(Ex);
			}

			return null;
		}
	}
}
