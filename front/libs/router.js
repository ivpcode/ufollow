
let Paths = [];
class IVPRouter {
    routes = [];

    mode = null;

    root = '/';

    constructor(options) {
        this.mode = window.history.pushState ? 'history' : 'hash';
        if (options.mode) this.mode = options.mode;
        if (options.root) this.root = options.root;
        this.listen();

        for(let i=0;i<Paths.length;i++)
            this.add(Paths[i].Path, Paths[i].Function);
    }

    add = (path, cb) => {
        if (path == "")
            this.routes.push({ path, cb });
        else
            this.routes.unshift({ path, cb })

        return this;
    };

    remove = path => {
        for (let i = 0; i < this.routes.length; i += 1) {
            if (this.routes[i].path === path) {
                this.routes.slice(i, 1);
                return this;
            }
        }
        return this;
    };

    flush = () => {
        this.routes = [];
        return this;
    };

    clearSlashes = path =>
        path
            .toString()
            .replace(/\/$/, '')
            .replace(/^\//, '');

    getFragment = () => {
        let fragment = '';
        if (this.mode === 'history') {
            fragment = this.clearSlashes(decodeURI(window.location.pathname + window.location.search));
            fragment = fragment.replace(/\?(.*)$/, '');
            fragment = this.root !== '/' ? fragment.replace(this.root, '') : fragment;
        } else {
            const match = window.location.pathname.match(/#(.*)$/);
            fragment = match ? match[1] : '';
        }
        return this.clearSlashes(fragment);
    };

    navigate = (path = '') => {
        if (this.mode === 'history') {
            window.history.pushState(null, null, this.root + this.clearSlashes(path));
        } else {
            window.location.href = `${window.location.href.replace(/#(.*)$/, '')}#${path}`;
        }
        return this;
    };

    push = () => {
        window.history.pushState(null, null);
    }

    back = () => {
        window.history.back()
    };

    listen = () => {
        clearInterval(this.interval);
        this.interval = setInterval(this.interval, 50);
    };

    interval = () => {
        if (this.current === this.getFragment()) return;
        this.current = this.getFragment();

        this.routes.some(route => {
            const match = this.current.match(route.path);
            if (match) {
                match.shift();
                route.cb.apply({}, match);
                return match;
            }
            return false;
        });
    };

    static Register(Path,Function) {
        if (window.router == null) {
            if (Path == "")
                Paths.push({"Path": Path, "Function": Function})
            else
                Paths.unshift({"Path": Path, "Function": Function})
        }
        else
            window.router.add(Path,Function);
    }
}

export default IVPRouter;
window.IVPRouter = IVPRouter;

window.router = new IVPRouter({
    mode: 'history',
    root: '/'
});
