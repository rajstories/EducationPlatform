import { app, setupPromise } from '../server/index';

export default async (req: any, res: any) => {
    await setupPromise;
    return app(req, res);
};

