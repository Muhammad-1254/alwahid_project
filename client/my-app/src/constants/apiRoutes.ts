const prefix = `${process.env.EXPO_PUBLIC_SERVER_DOMAIN_DEV}/api`;

export const apiRoutes = {
    login: `${prefix}/auth/login`,
    createPostMediaPresignedUrl: `${prefix}/post/presigned-url`,
    createPost: `${prefix}/post/create`,
    findUserPersonalPosts: `${prefix}/post/user/personal`,
}
