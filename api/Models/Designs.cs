using Helpers;
using Newtonsoft.Json;
using Org.BouncyCastle.Bcpg;
using System;
using System.Collections.Generic;
using System.Text;

namespace SolidShapeApi.Models
{
	class Designs
	{

		public class TDesign
		{
			public Int64 ID = -1;
			[JsonIgnore]
			public Int64 UserID;
			public String Title;
			public String ImageURL;
			public String StlURL;
			public Int64 PrintsCount;
			public Int64 Size;
			public DateTime CreationDateTime;

			public object Format()
			{
				return new
				{
					ID = this.ID,
					Title = Utilities.DecodeHTMLEntities(this.Title),
					ImageURL = Types.ToString(this.ImageURL),
					StlURL = Types.ToString(this.StlURL),
					PrintsCount = this.PrintsCount,
					Size = this.Size,
					CreationDateTime = FormatDateTimeToISO8601(this.CreationDateTime)
				};
			}
		}

		private static String FormatDateTimeToISO8601(DateTime UTCDateTime, bool ExtendedNotation = true)
		{
			// Il formato ISO8601, qui si suppone una data-ora in UTC, da cui la Z alla fine
			//http://support.sas.com/documentation/cdl/en/lrdict/64316/HTML/default/viewer.htm#a003169814.htm

			if (ExtendedNotation == true)
				return UTCDateTime.ToString("yyyy-MM-ddTHH:mm:ssZ");    // Extended notation: E8601DZw.d

			return UTCDateTime.ToString("yyyyMMddTHHmmssZ");    // Basic notation: B8601DZw.d
		}

		public static object[] Format(TDesign[] vDesigns)
		{
			try
			{
				List<object> lsRet = new List<object>();
				foreach (TDesign d in vDesigns)
					lsRet.Add(d.Format());

				return lsRet.ToArray();
			}
			catch (Exception Ex)
			{
				LogHelper.Error(Ex);
			}

			return null;
		}

		public static bool HasRights(Int64 UserID, Int64 DesignID, DatabaseHelper Db)
		{
			try
			{
				Int64 _UserID = Types.ToInt64(Db.DoOneFieldQuery("SELECT UserID FROM designs WHERE ID=@0", DesignID), -1);
				return UserID == _UserID;
			}
			catch (Exception Ex)
			{
				LogHelper.Error(Ex);
			}

			return false;
		}

		public static TDesign[] List(Int64 UserID, DatabaseHelper Db)
		{
			try
			{
				TDesign[] vd = Db.DoSelectQueryArray<TDesign>("SELECT * FROM designs WHERE UserID=@0", UserID);

				return vd;
			}
			catch (Exception Ex)
			{
				LogHelper.Error(Ex);
			}

			return null;
		}

		public static TDesign Get(Int64 UserID, Int64 DesignID, DatabaseHelper Db)
		{
			try
			{
				TDesign d = Db.DoSelectQuery<TDesign>("SELECT * FROM designs WHERE UserID=@0 AND ID=@1", UserID, DesignID);

				return d;
			}
			catch (Exception Ex)
			{
				LogHelper.Error(Ex);
			}
			return null;
		}

		public static TDesign Save(Int64 UserID, Int64 DesignID, KeyValueHelper kvData, DatabaseHelper Db)
		{
			try
			{
				kvData["UserID"] = UserID;
				if (DesignID == -1)
				{
					DesignID = Db.DoExecInsertQuery("designs", kvData);
				}
				else
				{
					kvData["ID"] = DesignID;
					Db.DoExecUpdateQuery("designs", kvData);
				}

				return Get(UserID, DesignID, Db);
			}
			catch (Exception Ex)
			{
				LogHelper.Error(Ex);
			}
			return null;
		}
	}
}
