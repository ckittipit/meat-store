import { join, isAbsolute } from 'path';

export function getUploadRoot() {
    const uploadRoot = process.env.UPLOAD_ROOT || 'uploads';

    if (isAbsolute(uploadRoot)) {
        return uploadRoot;
    }

    return join(process.cwd(), uploadRoot);
}
