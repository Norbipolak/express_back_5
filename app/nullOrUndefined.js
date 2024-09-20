function nullOrUndefined(data) {
    return data === undefined || data === null || data.length === 0;
}

export default nullOrUndefined;

/*
    Bejön egy data, paraméterként -> function nullOrUndefined(data)
    és majd ezt fogjuk return-ölni vele 
    -> 
    return data === undefined || data === null || data.length === 0;
    És nagyon fontos, hogyha null vagy undefined a data, akkor nincsen length-je!!!! 
    Akkor ha ezt raktuk volna az elejére (data.length === 0), akkor kaptunk volna egy hibát 
    mert, hogy a null-nál meg az undefined-nél próbáltuk volna megnézni a length tulajdonságot
    és akkor kapnánk egy ilyet, hogy can not read properties of undefined or null 
    ->
    Tehát a length-et mindig a végére kell majd tenni 
    Ha nem előre akarjuk tenni, akkor azt kellene, hogy a data !== "";
    De ez a length-es megoldás, jobb! -> tehát ez egy string, csak nem adta meg!!!!!!!!!!!!!!!

    Ezt be is kell majd importálni a userHandler-be, mert ott fogjuk majd felhasználni!!! 
*/