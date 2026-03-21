from app.extensions import scheduler

def create_app():
    app = Flask(__name__)

    # existing config...

    scheduler.init_app(app)
    scheduler.start()

    return app