import os
import glob

repos = glob.glob('backend/src/main/java/com/sacl/repository/*.java')
for repo in repos:
    with open(repo, 'r') as f:
        content = f.read()
    
    if "GROUP BY r.createdBy" in content:
        import re
        # Find everything between @Query("SELECT r.createdBy and GROUP BY r.createdBy")
        pattern = r'@Query\("SELECT r\.createdBy.*?GROUP BY r\.createdBy"\)\s*'
        new_content = re.sub(pattern, '', content, flags=re.DOTALL)
        
        if new_content != content:
            with open(repo, 'w') as f:
                f.write(new_content)
            print(f"Cleaned {repo}")
