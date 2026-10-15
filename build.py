from pathlib import Path
from shutil import copytree


project_root = Path(__file__).parent
source = project_root / "static"
public_dir = project_root / "public"
destination = public_dir / "static"
copytree(source, destination, dirs_exist_ok=True)

index_html = (project_root / "templates" / "index.html").read_text(encoding="utf-8")
for asset in ("style.css", "app.js", "ayaz-logo.svg"):
	index_html = index_html.replace(
		f"{{{{ url_for('static', filename='{asset}') }}}}",
		f"/static/{asset}",
	)

(public_dir / "index.html").write_text(index_html, encoding="utf-8")
print(f"Static site prepared in {public_dir}")
