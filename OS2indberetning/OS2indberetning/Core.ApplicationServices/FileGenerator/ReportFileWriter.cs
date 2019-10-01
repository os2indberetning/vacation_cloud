﻿using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;

namespace Core.ApplicationServices.FileGenerator
{
    public class ReportFileWriter : IReportFileWriter
    {
        private string _filePathName;
        private string _backupFilePathName;
        private readonly IConfiguration _config;

        public ReportFileWriter(IConfiguration config)
        {
            _config = config;
            _filePathName = _config["PROTECTED_KMDFilePath"] + @"\" + _config["PROTECTED_KMDFileName"];
            _backupFilePathName = _config["PROTECTED_KMDBackupFilePath"] + @"\" + DateTime.Now.ToString("yyyymmdd-hhmmss");
        }

        public bool WriteRecordsToFile(ICollection<FileRecord> recordList)
        {
            var existingLineCounter = 0;
            if (File.Exists(_filePathName))
            {
                existingLineCounter += File.ReadLines(_filePathName).Count();
            }
            else
            {
                WriteHeader();
                existingLineCounter++;
            }

            WriteRecords(recordList);

            var totalLineCount = File.ReadLines(_filePathName).Count();

            if ((totalLineCount - existingLineCounter) < recordList.Count)
            {
                var oldLines = ReadOldLines(existingLineCounter);

                using (var newWriter = new StreamWriter(_filePathName))
                {
                    foreach (var entry in oldLines)
                    {
                        newWriter.WriteLine(entry);
                    }
                    newWriter.Close();
                }
                Console.WriteLine("Error not all records were written to file, changes were rolled back");
                return false;
            }
            else
            {
                File.Copy(_filePathName, _backupFilePathName);
                return true;
            }
        }

        private void WriteHeader()
        {
            using (var writer = new StreamWriter(_filePathName))
            {
                writer.WriteLine(_config["PROTECTED_KMDHeader"]);
                writer.Close();
            }
        }

        private void WriteRecords(ICollection<FileRecord> recordList)
        {
            using (var writer = new StreamWriter(_filePathName, true))
            {
                foreach (var record in recordList)
                {
                    writer.WriteLine(record.ToString());
                }
                writer.Flush();
                writer.Close();
                writer.Dispose();
            }
        }

        private IEnumerable<string> ReadOldLines(int existingLineCounter)
        {
            var tempList = new List<string>();
                using (var newReader = new StreamReader(_filePathName))
                {
                    string line;
                    while ((line = newReader.ReadLine()) != null)
                    {
                        if (tempList.Count == existingLineCounter)
                        {
                            break;
                        }
                        tempList.Add(line);
                    }
                    newReader.Close();
                }
            return tempList;
        }            
    }
}
