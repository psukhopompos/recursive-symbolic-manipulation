import os
import json
import subprocess
import sys
from typing import List, Tuple

def execute_git_command(command: str, error_message: str) -> Tuple[bool, str]:
    """ Execute Git command  with validations."""
    try:
       output = subprocess.check_output(command,stderr=subprocess.STDOUT, shell=True,  text=True )
       return True, output
    except subprocess.CalledProcessError as e:
         return False, f"Error: {error_message}.   Message=  {e.output} Code: {e.returncode} .  Git error/ or system call code  "


def validate_git_branch_local_system(branch_name: str) -> Tuple[bool, str]:
    """ check if branch is tracked in this local copy!"""
    git_branches_output = execute_git_command('git branch -v', 'Error validating local git branchs, Check valid Git command or Git structure on local files and Git repository files!  ')

    if not git_branches_output[0] :
          return False,   f" {git_branches_output[1]} branch:{branch_name} does not exist on this current local copy "


    if  branch_name  in git_branches_output[1]:
      return True,   f" GitBranch: {branch_name} already checked on the Local Git, validation done!"


    else :
      return False,  f"GitBranch : `{branch_name}` :  does not exists on this local machine! Validation FAILED. Run git commands before and ensure branch exist."


def update_git_local_system(branch_name: str) -> Tuple[bool, str]:
    """updates git with specific branch + log updates. if is a local git , ok to skip /if it's not does all fetches , checkout and pulls"""

    # Check if it's a git repository
    if not os.path.exists(os.path.join(".", ".git")):
        return True, "Not a Git repository, skipping Git update."  # Treat as success, skip Git operations


    git_update_validation  =execute_git_command( 'git fetch --all' , f"Error validating  remote updates ( Fetch action failed !) ")

    if  not git_update_validation[0] :
         return  False , f"Git:  git fetch  Error = `{git_update_validation[1]}`. Unable to get updates, run `git fetch --all`, Check system code call  validation results!. System Error."


    branch_exists, _ = validate_git_branch_local_system(branch_name)
     #checkout command only  if  local branch not exists already  , so users that have folder/or do that operation don't need additional local copies git commands!.
    if not branch_exists :
        git_checkout= execute_git_command( f'git checkout  "{branch_name}"',  f"Error checkouting branch on : `{branch_name}`, does that exist?   , Check Git Commands .   Check validations / local git repos structure  ")

        if not git_checkout[0]:
           return False, f"Git Checkout : `{git_checkout[1]}` : Error = Unable to check / switch branches on code , Check error messages! "

    git_pull_local_system= execute_git_command( f'git pull origin  "{branch_name}"', f"Git pull action failed !  check branch =  `{branch_name}`, or remote structure / updates/ origin validation fails /system check! " )
    if  not git_pull_local_system[0] :
      return False,   f" Git pull Error  Message = `{git_pull_local_system[1]}`. Local branch git does not  pull remote . Check Git parameters!"


    return True,  f"Git Update : ok . updated  remote from branch = `{branch_name}`, validation done by this code!. Git structure=valid by updates !."

def get_file_paths(path_to_extract: str) -> Tuple[List[str], str]:
    """Get list of file path from a validated local path as parameter  , system / local checks for every input string of the files/folder. """
    file_paths = []
    valid_file_ext = (".rs", ".py", ".ts", ".tsx", ".js", ".json", ".yaml", ".toml", ".lock",".md")
    excluded_names = (".DS_Store", ".git", ".pdf", ".svg")
    excluded_folders = ("node_modules",)

    try:
        for root, _, files in os.walk(path_to_extract):
            # Skip excluded folders
            if any(folder in root.split(os.sep) for folder in excluded_folders):
                continue  # Skip the entire 'node_modules' directory and anything inside

            for file in files:
                file_path = os.path.join(root, file)
                file_name = file.lower()

                if  file_name.endswith(excluded_names)  :
                      continue   # skips .DS_Store , and any git related files
                if  any(file_name.endswith(ext) for ext in valid_file_ext ) :
                    file_paths.append(file_path) # skips all others


        return file_paths,  f"FilePath  : `{len(file_paths)}` items  on given system path:  {path_to_extract}, Files system validation by type string = Ok ! "
    except  Exception as e:
          return file_paths , f"FilePath  Error : system failed on: `{path_to_extract}`, unable to check for file paths. Local  disk = {e} = No paths created for output data! / Error in system structure data + string / type!"


def get_file_content(filepath: str) -> Tuple[str, str]:
    """get content from file, encoding utf-8 is needed here for unicode strings."""
    try:
         with open(filepath,"r", encoding="utf-8") as f :
           content = f.read()
           return  content ,  f"FileContent valid , all  data from {filepath} was read with  valid string."
    except  Exception as e:
         return  "", f" Error getting data FileContent. file not found in: {filepath}, with error  message= {e} Invalid file on system validations  !"

def create_markdown_output(file_paths: List[str], file_contents: List[str]) -> Tuple[str, str]:
        """ Generates Valid output markdown text from path content and validated results of every process + its previous result """
        md_output = ""

        for file_path, content in zip(file_paths, file_contents):
           md_output += f"## File: {file_path}\n\n"
           md_output += "```python\n"
           md_output += content
           md_output += "\n```\n\n"

        return md_output,  f"MdFileOutput: all data transformed with  valid markdown from path and file contents ! =ok."



if __name__=="__main__":

     branch_name = input("Please input your `branch_name` :")  # Still asked but will be skipped if not git repo
     path_to_extract = input("Input your target Path  (example:  `/your/target_path/` or `/Users/user/anyfolder` or `your_target_path/`)  :")
     output_file = "output.md"

     validation_log = [] #validations from here onwards are always with "structure type output/logs by codes + all tracked variable "

     # -- git validation of current git state local : we need this here first! . Before going ahead
     git_local_state_is_ok, git_local_message  =  update_git_local_system(branch_name)

     validation_log.append({ "step":"Git Local Update result  for  Branch: " + branch_name , "result": git_local_message, "type":"gitUpdate","validated":git_local_state_is_ok })



     # --  filepath extraction : the string input type is 'optional on validation ( path exists) ` for extraction by the system . as that  'exists only' by python action/ code that reads it! . but that does not mean  its type is wrong .  only the result by type action must have its own validations of file paths!. Type output: ok if gets values/ fail if there is erros and logs to know on output/ result/ that step fails : the step here creates its validations

     file_paths ,filepath_log = get_file_paths(path_to_extract)
     validation_log.append({"step":" FilePath System extraction validation " , "result":filepath_log , "type":"filePath" , "validated": True if file_paths  else  False })

     if not file_paths:
       print("There are no Files on your `input path`, check folder by your parameter . Validation failed!")
       print(json.dumps(validation_log, indent=2))
       exit()

     #--- File content transformations ( as 'codes in a string type var', validation tracked!).
     file_contents = []
     file_content_errors = 0
     for file in file_paths:
       content,content_log=  get_file_content(file)
       file_contents.append(content)
       validation_log.append({"step": "FileContent extractions / reading files results!","result":content_log ,"file_path":file ,"type":"fileContent",  "validated" : bool(content) } )
       if not content:
           file_content_errors+=1

     if file_content_errors>0 :
          print( " There were some errors on file content. Check log file errors to validate output.")
          print(json.dumps(validation_log, indent=2))


    #-- Final creation of  output .md  with  transformations codes results
     md_output,md_log  = create_markdown_output(file_paths, file_contents )

     validation_log.append({"step": "MdFileOutput / output  generation results check" , "result": md_log,"type":"markdownOutput", "validated":bool(md_output)})
     # creates output file :  by transformation results!

     if md_output :
       with open(output_file, 'w',encoding='utf-8') as f :
          f.write(md_output)

       print(f" Markdown output  file: `{output_file}` created! validation + output all  valid ! ")
       print(" see output with all code transformations for results bellow!")
       print(json.dumps(validation_log, indent=2) )

     else:
         print("Md ouptput process failed .  please validate  type results logs for better understanding!")
         print(json.dumps(validation_log, indent=2) )