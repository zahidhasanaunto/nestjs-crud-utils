import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { getConnection } from 'typeorm';
import {
  QueryFilter,
  RequestQueryException,
  RequestQueryParser,
  SCondition,
} from '../../crud-request';
import {
  getEntityMetadata,
  hasLength,
  isArrayFull,
  isFunction,
  isNil,
} from '../../util';

import { PARSED_CRUD_REQUEST_KEY } from '../constants';
import { CrudActions } from '../enums';
import { CrudRequest, MergedCrudOptions } from '../interfaces';
import { QueryFilterFunction } from '../types';
import { CrudBaseInterceptor } from './crud-base.interceptor';

@Injectable()
export class CrudRequestInterceptor
  extends CrudBaseInterceptor
  implements NestInterceptor
{
  async intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();

    try {
      if (!req[PARSED_CRUD_REQUEST_KEY]) {
        const { ctrlOptions, crudOptions, action } = this.getCrudInfo(context);

        if (req.query && req.query.searchTerm) {
          await this.setSearchTerm(ctrlOptions.model.type, req);
        }

        const parser = RequestQueryParser.create();

        parser.parseQuery(req.query, crudOptions.operators.custom);

        if (!isNil(ctrlOptions)) {
          const search = this.getSearch(
            parser,
            crudOptions,
            action,
            req.params
          );
          const auth = this.getAuth(parser, crudOptions, req);
          parser.search = auth.or
            ? { $or: [auth.or, { $and: search }] }
            : { $and: [auth.filter, ...search] };
        } else {
          parser.search = { $and: this.getSearch(parser, crudOptions, action) };
        }

        req[PARSED_CRUD_REQUEST_KEY] = this.getCrudRequest(parser, crudOptions);
      }

      return next.handle();
    } catch (error) {
      throw error instanceof RequestQueryException
        ? new BadRequestException(error.message)
        : error;
    }
  }

  async setSearchTerm(entity, req) {
    const entityMetadata = await getEntityMetadata(entity);

    if (entityMetadata.searchTerms.length) {
      const searchTerms = entityMetadata.searchTerms.map((term) => {
        return { [term]: { $contL: req.query.searchTerm } };
      });

      req.query.s = JSON.stringify({ $or: searchTerms });
    }
    delete req.query.searchTerm;
  }

  getCrudRequest(
    parser: RequestQueryParser,
    crudOptions: Partial<MergedCrudOptions>
  ): CrudRequest {
    const parsed = parser.getParsed();
    const { query, routes, params, operators } = crudOptions;

    return {
      parsed,
      options: {
        query,
        routes,
        params,
        operators,
      },
    };
  }

  getSearch(
    parser: RequestQueryParser,
    crudOptions: Partial<MergedCrudOptions>,
    action: CrudActions,
    params?: any
  ): SCondition[] {
    const paramsSearch = this.getParamsSearch(parser, crudOptions, params);

    // if `CrudOptions.query.filter` is a function then return transformed query search conditions
    if (isFunction(crudOptions.query.filter)) {
      const filterCond =
        (crudOptions.query.filter as QueryFilterFunction)(
          parser.search,
          action === CrudActions.ReadAll
        ) || {};

      return [...paramsSearch, filterCond];
    }

    // if `CrudOptions.query.filter` is array or search condition type
    const optionsFilter = isArrayFull(crudOptions.query.filter)
      ? (crudOptions.query.filter as QueryFilter[]).map(
          parser.convertFilterToSearch
        )
      : [(crudOptions.query.filter as SCondition) || {}];

    let search: SCondition[] = [];

    if (parser.search) {
      search = [parser.search];
    } else if (hasLength(parser.filter) && hasLength(parser.or)) {
      search =
        parser.filter.length === 1 && parser.or.length === 1
          ? [
              {
                $or: [
                  parser.convertFilterToSearch(parser.filter[0]),
                  parser.convertFilterToSearch(parser.or[0]),
                ],
              },
            ]
          : [
              {
                $or: [
                  { $and: parser.filter.map(parser.convertFilterToSearch) },
                  { $and: parser.or.map(parser.convertFilterToSearch) },
                ],
              },
            ];
    } else if (hasLength(parser.filter)) {
      search = parser.filter.map(parser.convertFilterToSearch);
    } else {
      if (hasLength(parser.or)) {
        search =
          parser.or.length === 1
            ? [parser.convertFilterToSearch(parser.or[0])]
            : [
                {
                  $or: parser.or.map(parser.convertFilterToSearch),
                },
              ];
      }
    }

    return [...paramsSearch, ...optionsFilter, ...search];
  }

  getParamsSearch(
    parser: RequestQueryParser,
    crudOptions: Partial<MergedCrudOptions>,
    params?: any
  ): SCondition[] {
    if (params) {
      parser.parseParams(params, crudOptions.params);

      return isArrayFull(parser.paramsFilter)
        ? parser.paramsFilter.map(parser.convertFilterToSearch)
        : [];
    }

    return [];
  }

  getAuth(
    parser: RequestQueryParser,
    crudOptions: Partial<MergedCrudOptions>,
    req: any
  ): { filter?: any; or?: any } {
    const auth: any = {};

    if (crudOptions.auth) {
      const userOrRequest = crudOptions.auth.property
        ? req[crudOptions.auth.property]
        : req;

      if (isFunction(crudOptions.auth.or)) {
        auth.or = crudOptions.auth.or(userOrRequest);
      }

      if (isFunction(crudOptions.auth.filter) && !auth.or) {
        auth.filter = crudOptions.auth.filter(userOrRequest) || {};
      }

      if (isFunction(crudOptions.auth.persist)) {
        parser.setAuthPersist(crudOptions.auth.persist(userOrRequest));
      }
    }

    return auth;
  }
}
