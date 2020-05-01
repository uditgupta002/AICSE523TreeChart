import pandas as pd
import glob
import os

def process_file(dir_path):

  file_path_list = glob.glob(dir_path + "/*.csv")
  main_dataframe = pd.DataFrame()
  for file_path in file_path_list:
    if('annotations' in file_path or 'result' in file_path):
      continue
    else:
      dataframe = pd.read_csv(file_path)
      main_dataframe = pd.concat([main_dataframe, dataframe])

  #file_name = file_path.split('.')
  annotation_file_name = os.path.join(dir_path, 'annotations.tsv')
  result_file_name = 'output_result.csv'
  annotation_dataframe = pd.read_csv(annotation_file_name,names=['Quality', 'parentId','ID','Col1','Col2'], sep='\t', header=0)

  #Convert to all strs
  dataframe['ID'] = dataframe['ID'].astype('str')
  annotation_dataframe['ID'] = annotation_dataframe['ID'].astype('str')
  annotation_dataframe['parentId'] = annotation_dataframe['parentId'].astype('str')


  #Duplicate rows keep one
  #self loops removal
  #parentId < childId
  #plot only one thread
  #seperate file for each thread
  #thread selection using drop down menu

  annotation_dataframe = annotation_dataframe[annotation_dataframe['ID'] != annotation_dataframe['parentId']]
  annotation_dataframe = annotation_dataframe.drop_duplicates(['ID','parentId'])
  dataframe[dataframe.duplicated(['ID'])]

  #Merge two dataframes on ID column
  merged_df = pd.merge(dataframe, annotation_dataframe[['parentId','ID']], how='left',on='ID')

  #Deal with duplicates
  duplicate_rows = merged_df[merged_df['ID'].duplicated()]['ID'].values

  #Dictionary to save all duplicate values
  duplicate_id_dict = {}
  for dup_id in duplicate_rows:
    duplicate_id_dict[dup_id] = 0

  #Method to search and modify for all duplicate ids
  def removedup(value):
    if(value in duplicate_id_dict):
        if(duplicate_id_dict[value] == 0):
          duplicate_id_dict[value] = duplicate_id_dict[value] + 1
          return value
        else:
          return value + 'dup'
    else:
      return value

  #Modified all duplicate ID's to have a dup keyword after them
  merged_df['ID'] = merged_df['ID'].apply(lambda row: removedup(row))

  #Make all first level roots
  merged_df['parentId'] = merged_df['parentId'].fillna('Root')

  #Save as a CSV file in current folder
  merged_df.to_csv(result_file_name,index=False)


input_folder_path = '/content/drive/My Drive/cse523data/input_folder'
process_file(input_folder_path)
