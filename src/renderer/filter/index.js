/**
 * Created by obel on 2020/2/2.
 */
export function moneyParse(cent) {
  try {
    cent = parseInt(cent)/100;
    return cent.toFixed(2);
  }
  catch (e){
    return null;
  }
}
