﻿//TK: IVAN - 20181116_09 - FILE
using System;
using Helpers;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Models;
using Renci.SshNet;

namespace SolidShape
{
	class Program
	{
		static void Main(string[] args)
		{
			// Load IniFile
			Sets.IniFileName = Path.Combine(Path.GetDirectoryName(Path.GetDirectoryName(AppDomain.CurrentDomain.BaseDirectory)), "Config.ini");
			if (Sets.Load() == false)
			{
				// Se non lo trova prova a caricarlo da una directory pi� in su
				Sets.IniFileName = Path.Combine(Path.GetDirectoryName(Path.GetDirectoryName(Sets.IniFileName)), "Config.ini");
				if (Sets.Load() == false)
				{
					Sets.IniFileName = Path.Combine(Path.GetDirectoryName(Path.GetDirectoryName(Sets.IniFileName)), "Config.ini");
					if (Sets.Load() == false)
					{
						LogHelper.Info("{0} Inifile load failure: {1} - Errors: {2}", VersionHelper.csSoftwareFullNameAndVersion, Sets.IniFileName, Sets.LastError);
						Task.Delay(5000).Wait();
						return;
					}
				}
			}

			LogHelper.Info(VersionHelper.csSoftwareFullNameAndVersion);
			LogHelper.Info("  Ini File: {0}", Sets.IniFileName);

			LogHelper.Init(Path.Combine(Sets.LOG_REPOSITORY, VersionHelper.csSoftwareName));

			LogHelper.Info("  Check DB Connection");
			DatabaseHelper db = new DatabaseHelper();
			db.SetDbConnectionData(Sets.DATABASE_HOST, Sets.DATABASE_PORT, Sets.DATABASE_USER, Sets.DATABASE_PASSWORD, Sets.DATABASE_NAME, Sets.SOLIDSHAPE_API_MAX_CONN_POOL);
			if (db.OpenConnection() == false)
			{
				LogHelper.Info(": Error");
				return;
			}
			LogHelper.Info(": OK");

			// Prima di far partire i server chiude il db utilizzato per test ed inizializzazione
			db.CloseConnection();


			// Fa partire il background worker
			Task.Run(() => { BkgWorker(); });

			HttpdLib.CRequest.DebugMode = Sets.DEBUG;
			SolidShapeApi api = new SolidShapeApi();
			api.Run(Sets.SOLIDSHAPE_API_HTTP_LISTEN_URL,
					Sets.DATABASE_HOST,
					Sets.DATABASE_PORT,
					Sets.DATABASE_USER,
					Sets.DATABASE_PASSWORD,
					Sets.DATABASE_NAME,
					Sets.SOLIDSHAPE_API_MAX_CONN_POOL+1);
		}

		static void BkgWorker()
		{
			// N.B.: lo step � 5 secondi, se imposto il val iniziale a 5 evito il trig del task all'avvio del worker
			int nSecondsCount = 5;			

			while (true)
			{
				try
				{
					using (var Db = new DatabaseHelper())
					{
						Db.SetDbConnectionData(Sets.DATABASE_HOST, Sets.DATABASE_PORT, Sets.DATABASE_USER, Sets.DATABASE_PASSWORD, Sets.DATABASE_NAME, 1);
						if (Db.OpenConnection() == false)
							LogHelper.Throw("Db.OpenConnection() == false");

						// Esegue tasks temporizzati
						//if (nSecondsCount % 5 == 0)
						//	TaskEvery_5Seconds(Db);

						//if (nSecondsCount % 15 == 0)
						//	TaskEvery_15Seconds(Db);

					}

					nSecondsCount += 5;
				}
				catch (Exception Ex)
				{
					LogHelper.Error("Exception: {0}", Ex.Message);
				}

				Thread.Sleep(5000);
			}
		}

	}
}
