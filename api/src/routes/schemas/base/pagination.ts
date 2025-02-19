import { Type } from '@sinclair/typebox';

const Pagination = {
    total_count: Type.Union([Type.Number(), Type.Null()]),
    total_pages: Type.Union([Type.Number(), Type.Null()]),
    current_page: Type.Union([Type.Number(), Type.Null()]),
    page_size: Type.Union([Type.Number(), Type.Null()]),
};

export default Pagination;
