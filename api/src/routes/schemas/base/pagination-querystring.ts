import { Type } from '@sinclair/typebox';

const PaginationQueryString = {
    page: Type.Optional(Type.Number()),
    page_size: Type.Optional(Type.Number()),
};
export default PaginationQueryString;
