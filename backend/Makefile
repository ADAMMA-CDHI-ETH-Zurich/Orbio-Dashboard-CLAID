PYTHON = python3
FILES ?= .
EXCLUDE = venv
PORT = 8080

.PHONY: format lint typecheck all

# Run backend development server
dev:
	flask run

# Run backend production server
run:
	gunicorn -w 4 -b 0.0.0.0:$(PORT) --access-logfile - run:app

# Run code formatter
format:
	black $(FILES) --exclude $(EXCLUDE)

# Run linter
lint:
	flake8 $(FILES) --exclude $(EXCLUDE)

# Run type checker
typecheck:
	mypy $(FILES) --exclude $(EXCLUDE)

# Run all tools
all: format lint typecheck
