using Helpers;
using System;
using System.Collections.Generic;
using System.Text;

namespace Models
{
	public class Sets : Settings<Sets>
	{
		//:: Static settings section
		[INIProperty(AllowMissing = true)]
		public static bool DEBUG = false;

		[INIProperty()]
		public static String LOG_REPOSITORY;
		[INIProperty()]
		public static String SERVER_HINSTANCE_UUID;
		

		[INIProperty()]
		public static String DATABASE_HOST = "127.0.0.1";
		[INIProperty()]
		public static int DATABASE_PORT = 3306;
		[INIProperty()]
		public static String DATABASE_USER = "root";
		[INIProperty()]
		public static String DATABASE_PASSWORD = "";
		[INIProperty()]
		public static String DATABASE_NAME = "";

		[INIProperty()]
		public static String SOLIDSHAPE_API_HTTP_LISTEN_URL;
		[INIProperty()]
		public static int SOLIDSHAPE_API_MAX_CONN_POOL;
		[INIProperty()]
		public static String SOLIDSHAPE_API_REPOSITORY_BASE_PATH;
		[INIProperty()]
		public static String SOLIDSHAPE_API_KEY;
	}
}
