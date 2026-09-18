import {createParser} from 'nuqs';

export const getSortingStateParser = function (columnIds){
    return createParser({
        parse: function(value){
            try{
                var parsed = JSON.parse(value);
                if(!Array.isArray(parsed)) return null
                var result = {data:[]};

                for(let item of parsed){
                    if(typeof item !== 'object' && 
                        typeof item.column !== 'string' &&
                        (typeof item.desc !== 'number' || typeof item.desc !== 'boolean' || typeof item.desc !== 'string')
                    ){
                        return null;
                    }
                    result.data.push({column:item.column, desc:item.desc});
                }

                return result.data.filter(item=> item.column && columnIds.includes(item.column) && item.desc !== undefined);

            }catch(e){
                // console.error('Error parsing sorting state:',e);
                return null;
            }
        },
        serialize:(value)=> JSON.stringify(value),
        eq: function (a,b){
            return a.length === b.length &&
            a.every(function (item, index){
                return item.column === b[index] && item.desc === b[index] && b[index] && item.column === b[index].column && item.desc === b[index].desc;
            });
        }
    });
};