import { Rule, Tree } from '@angular-devkit/schematics';
import {
  addSymbolToNgModuleMetadata,
  findNodes,
  getDecoratorMetadata,
  getProjectFromWorkspace,
  getProjectMainFile,
  insertAfterLastOccurrence,
  insertImport,
  parseSourceFile,
} from '@angular/cdk/schematics';
import { Change, InsertChange, NoopChange } from '@schematics/angular/utility/change';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { blue, cyan, yellow } from 'chalk';
import * as ts from 'typescript';
import * as ts3rd from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import { Schema } from '../schema';
import { WorkspaceDefinition } from '@angular-devkit/core/src/workspace';

export function registerLocale(options: Schema): Rule {
  return async (host: Tree) => {
    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace as unknown as WorkspaceDefinition, options.project);
    const appModulePath = getAppModulePath(host, getProjectMainFile(project));
    const moduleSource = parseSourceFile(host, appModulePath);

    const locale = options.locale || 'en_US';
    const localePrefix = locale.split('_')[0];

    const recorder = host.beginUpdate(appModulePath);

    const moduleSource3rd = moduleSource as unknown as ts3rd.SourceFile
    const changes = [
      insertImport(moduleSource3rd, appModulePath, 'NZ_I18N',
        'ng-zorro-antd/i18n'),
      insertImport(moduleSource3rd, appModulePath, locale,
        'ng-zorro-antd/i18n'),
      insertImport(moduleSource3rd, appModulePath, 'registerLocaleData',
        '@angular/common'),
      insertImport(moduleSource3rd, appModulePath, localePrefix,
        `@angular/common/locales/${localePrefix}`, true),
      registerLocaleData(moduleSource, appModulePath, localePrefix),
      ...insertI18nTokenProvide(moduleSource, appModulePath, locale)
    ];

    changes.forEach((change) => {
      if (change instanceof InsertChange) {
        recorder.insertLeft(change.pos, change.toAdd);
      }
    });

    host.commitUpdate(recorder);

    return;
  };
}

function registerLocaleData(moduleSource: ts.SourceFile, modulePath: string, locale: string): Change {
    const moduleSource3rd = moduleSource as unknown as ts3rd.SourceFile
  const allImports = findNodes(moduleSource3rd, ts3rd.SyntaxKind.ImportDeclaration);
  const allFun = findNodes(moduleSource3rd, ts3rd.SyntaxKind.ExpressionStatement);

  const registerLocaleDataFun = allFun.filter(node => {
    const fun = node.getChildren();
    return fun[0].getChildren()[0]?.getText() === 'registerLocaleData';
  });

  if (registerLocaleDataFun.length === 0) {
    return insertAfterLastOccurrence(allImports, `\n\nregisterLocaleData(${locale});`,
      modulePath, 0) as InsertChange;
  } else {
    console.log();
    console.log(yellow(`Could not add the registerLocaleData to your app.module file (${blue(modulePath)}).` +
      `because there is already a registerLocaleData function.`));
    console.log(yellow(`Please manually add the following code to your app.module:`));
    console.log(cyan(`registerLocaleData(${locale});`));
    return new NoopChange();
  }
}

function insertI18nTokenProvide(moduleSource: ts.SourceFile, modulePath: string, locale: string): Change[] {
    const moduleSource3rd = moduleSource as unknown as ts3rd.SourceFile
  const metadataField = 'providers';
  const nodes = getDecoratorMetadata(moduleSource3rd, 'NgModule', '@angular/core');
  const addProvide = addSymbolToNgModuleMetadata(moduleSource3rd, modulePath, 'providers',
    `{ provide: NZ_I18N, useValue: ${locale} }`, null);
  let node: any = nodes[0];  // tslint:disable-line:no-any

  if (!node) {
    return [];
  }

  const matchingProperties: ts.ObjectLiteralElement[] =
    (node as ts.ObjectLiteralExpression).properties
      .filter(prop => prop.kind === ts.SyntaxKind.PropertyAssignment)
      .filter((prop: ts.PropertyAssignment) => {
        const name = prop.name;
        switch (name.kind) {
          case ts.SyntaxKind.Identifier:
            return (name as ts.Identifier).getText(moduleSource) === metadataField;
          case ts.SyntaxKind.StringLiteral:
            return (name as ts.StringLiteral).text === metadataField;
        }

        return false;
      });

  if (!matchingProperties) {
    return [];
  }

  if (matchingProperties.length) {
    const assignment = matchingProperties[0] as ts.PropertyAssignment;
    if (assignment.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
      return [];
    }
    const arrLiteral = assignment.initializer as ts.ArrayLiteralExpression;
    if (arrLiteral.elements.length === 0) {
      return addProvide;
    } else {
      node = arrLiteral.elements.filter(e => e.getText?.().includes('NZ_I18N'));
      if (node.length === 0) {
        return addProvide;
      } else {
        console.log();
        console.log(yellow(`Could not provide the locale token to your app.module file (${blue(modulePath)}).` +
          `because there is already a locale token in provides.`));
        console.log(yellow(`Please manually add the following code to your provides:`));
        console.log(cyan(`{ provide: NZ_I18N, useValue: ${locale} }`));
        return [];
      }
    }
  } else {
    return addProvide;
  }

}
